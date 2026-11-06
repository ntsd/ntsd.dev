---
layout: post
title: "How to manage multiple Git accounts"
date: 2022-1-28
description: "How I set up multi SSH keys for multiple git accounts, To make Git can use the personal git and work git at the same time."
catalog: true
categories:
  - Software Development
tags:
  - Git
  - Security
published: true
---

## Set up SSH keys for multi git accounts

### 1. Generate SSH keys

Generate multiple SSH keys one for work and one for personal. You can have many multiple ssh key-pair for multiple git accounts as you want.

```shell
cd ~/.ssh
ssh-keygen -t ed25519 -C "your_personal_email@gmail.com" -f "id_ed25519_git"
ssh-keygen -t ed25519 -C "jirawat@opn.ooo" -f "id_ed25519_git_opn"
```

`-t`: Specific key type `ed25519` or `rsa`

`-C`: Specific comment

You will get 2 pairs of the SSH key-pair.

Private keys will name `id_ed25519_git` and `id_ed25519_git_opn`.

Public keys will name `id_ed25519_git.pub` and `id_ed25519_git_opn.pub`.

### 2. Add public keys to the Git Provider (Gihub/Gitlab/etc)

You have already generated the key pairs, Now let the Git provider know your SSH public key.

1. Copy the public key `pbcopy < ~/.ssh/id_ed25519_git_opn.pub` (avoid copy your private key)
2. Go to your git provider ssh setup panel
   <https://github.com/settings/keys> for Gihub
   <https://gitlab.com/-/profile/keys> for Gitlab
3. Paste the SSH public key and the Title you want
4. Generate a signature using the giving token from provider `echo -n 'token' | ssh-keygen -Y sign -n <name-space> -f id_ed25519_git.pub` you can replace the namespace
5. Apply the signature to the provider to verify

Next, do another one for the Github personal `pbcopy < ~/.ssh/id_ed25519_git.pub` to your personal git provider.

### 3. Creating the SSH Config (optional)

The SSH Config will help you choose the SSH key when you try to sign in to a different host.

```shell
touch config
vi config
```

Create and edit the ssh config file at `~/.ssh/config`

```text
# Personal Account
Host github.com
   HostName github.com
   User git
   IdentityFile ~/.ssh/id_ed25519_git

# Work Account
Host github.com-jirawat-opn
   HostName github.com
   User git
   IdentityFile ~/.ssh/id_ed25519_git_opn
```

Now you can clone or update your git URL.

```shell
git clone git@github.com-jirawat-opn:work_account/repo.git

# or the set origin url for the current repo

git remote set-url origin git@github.com-jirawat-opn:work_account/repo.git
```

For the personal git you can just do the normal way

```shell
git clone git@github.com:personal_account/repo.git

# or the set origin url for the current repo

git remote set-url origin git@github.com:personal_account/repo.git
```

## Set up GPG keys for multi git accounts (optional)

### 1. Generate a new GPG key

`gpg --default-new-key-algo ed25519 --gen-key`

and follow the prompt dialog.

### 2. Generate public key

First, list all your GPG private keys

`gpg --list-secret-keys --keyid-format=long`

The key id will follow the key method `ed25519/`

for example

```shell
sec   ed25519/3AA5C34371567BD2 2021-11-23 [SC]
uid                 [ultimate] Jirawat Boonkumnerd <jirawat@opn.ooo>
ssb   cv25519/127C6D28828B3B8C 2021-11-23 [E]
```

in this case the key id is `3AA5C34371567BD2`

### 3. Add a new uid and email to the key

3.1 `gpg --edit-key 3AA5C34371567BD2` to edit the key

3.2 `adduid` to add a new uid then fill your uid info and the another email

3.3 `uid` to show uid list

3.4 `uid 2` to choose uid 2

3.5 `trust` to trust the uid type `5` to ultimate trust then `y`

3.6 `save` the save edit

### 4. Add public keys to the Git Provider

export the public key

`gpg --armor --export 3AA5C34371567BD2`

Copy your GPG key and add to the Git provider. It may the same page as the SSH key.

If it ask to verify by a token, you can generate signature by using

`echo "token" | gpg -a --default-key 3AA5C34371567BD2 --detach-sig`

### 5. Set up git config to use the GPG key (optional)

`git config --global user.signingkey 3AA5C34371567BD2`

You can also edit the `~/.gitconfig`

or for specific repo

`git config user.signingkey 3AA5C34371567BD2`

craete a sign commit

`git commit -S -m 'test'`

to make it automatically sign commits

`git config --global commit.gpgsign true`

## Set Git config to use specific SSH and GPG keys

Add `sshCommand` config to use the specific ssh key for personal account,

and add include config for work account

`~/.gitconfig`

```
[user]
	name = ntsd
   email = jo06942@gmail.com
	signingkey = 3AA5C34371567BD2

[github]
	user = ntsd

[commit]
	gpgsign = true

[core]
   sshCommand = ssh -i ~/.ssh/id_ed25519_git

# include config if the path for company repo
[includeIf "gitdir/i:opn/"]
   path = .gitconfig.opn
```

for includeIf config will include the work config if the git directory under folder `opn` which is my work directory

`~/.gitconfig.opn`

```
[user]
   name = Jirawat Boonkumnerd
   email = jirawat@opn.ooo

[github]
	user = jirawat-opn

[core]
   # specific ssh key for git
   sshCommand = ssh -i ~/.ssh/id_ed25519_git_opn
```
