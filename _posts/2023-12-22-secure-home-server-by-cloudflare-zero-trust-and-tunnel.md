---
layout: post
title: "Secure home server by Cloudflare Zero Trust and Cloudflare Tunnel"
date: 2023-12-22
description: "Running a secure home server by Cloudflare Zero Trust, Cloudflare Tunnel, and connecting from the public internet by Cloudflare Warp Client."
catalog: true
categories:
  - Software Development
tags:
  - Network
  - Security
  - Cloudflare
  - Cloudflare Zero Trust
  - Cloudflare Tunnel
  - Tunnel
  - SSH
published: true
---

This is an article about running a secure home server by Cloudflare Zero Trust and Cloudflare Tunnel. You can connect from the public internet using Cloudflare Warp Client and the SSH server.

## Prerequisites

- Cloudflare Account (Free tier)
- Docker
- SSH Server

## Cloudflare Zero Trust

Cloudflare Zero Trust is a security architecture that replaces traditional network security perimeters with a more granular approach to access control. Instead of trusting everyone inside a network, Zero Trust assumes that no one is inherently trustworthy.

To create your Cloudflare Zero Trust Organization,
1. Create a Cloudflare account.
2. Go to <https://one.dash.cloudflare.com/>
3. Choose a team name.
4. Continuing the onboarding screen, you can choose "Zero Trust Free plan" for non subscription.

## Cludflare Tunnel

To access the private IP of the server from the public internet, you need to have a tunnel open for the server without requiring the NAT.

1. Create a Cloudflare Tunnel.

![cloudflare tunnel create](/img/in-post/2023-12-22-secure-home-server-by-cloudflare-zero-trust-and-tunnel/cloudflare-tunnel-1.png)

2. Choose Cloudflared tunnel type.

![cloudflare tunnel choose](/img/in-post/2023-12-22-secure-home-server-by-cloudflare-zero-trust-and-tunnel/cloudflare-tunnel-2.png)

3. Start the tunnel by Docker.

`docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <replace-with-token>`

You can also choose another way to run the tunnel, but I prefer Docker because we can remove it whenever we want.

![cloudflare tunnel start](/img/in-post/2023-12-22-secure-home-server-by-cloudflare-zero-trust-and-tunnel/cloudflare-tunnel-3.png)

Now the tunnel is running.

4. Mapping the Private IP to the Tunnel

![cloudflare tunnel mapping](/img/in-post/2023-12-22-secure-home-server-by-cloudflare-zero-trust-and-tunnel/cloudflare-tunnel-4.png)

Put the CIDR and the description of the network.

> [!CAUTION]
> Set your subnet mask carefully, all the IPs will be allowed to call from the internet.

![cloudflare tunnel mapping 2](/img/in-post/2023-12-22-secure-home-server-by-cloudflare-zero-trust-and-tunnel/cloudflare-tunnel-5.png)

To find the Private IP of the server, you can use `ifconfig` the ip will start with `172.*.*.*`.

## Running SSH Server

I will not write on this section because there are several ways to run the SSH server and expose the SSH port or Firewall.

For Ubuntu you can go to <https://ubuntu.com/server/docs/openssh-server>.

I would recommend creating a specific user for the SSH and generating the SSH key pair for it.

## Cloudflare Warp

Cloudflare Warp is a client software to connect to the Cloudflare Zero Trust and Cloudflare Tunnel on a secure private network.

1. Download and install Cloudflare Warp from <https://one.one.one.one/>
2. Enter the organization name that you created in Cloudflare Zero Trust
3. Connect and try to SSH by the Private IP of the server

It's worked.
