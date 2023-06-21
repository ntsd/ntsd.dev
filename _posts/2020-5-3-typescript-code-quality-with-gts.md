---
layout: post
title: "Improve TypeScript code quality with Google TypeScript Style Guide"
date: 2020-5-3 12:30:54
subtitle: "Using Google TypeScript Style Guide on your TypeScript React project"
catalog: true
categories:
    - Software Development
header-img: "../img/in-post/2020-5-3-typescript-code-quality-with-gts/clean.jpg"
tags:
    - Programming
    - TypeScript
    - ESLint
    - Frontend
published: true
---

GTS is Google's TypeScript style guide, and the configuration for formatter, linter, and automatic code fixer. No lint rules to edit, no configuration to update, no more bike shedding over syntax.

## Prepare a TypeScript Project

For this tutorial I'll initialize a TypeScript React project using Create React App.

``` Bash
# Install create-react-app cli
npm install -g create-react-app

# Initialize Create React App project
npx create-react-app my-app --template typescript

# Change directory to the app
cd my-app
```

## Installing GTS

To install GTS you can install it global and run init script.

``` Bash
# Install gts cli
npm install -g gts

# Add gts to the project
npx gts init
```

After you overwrite the `tsconfig.json`.

Then you can bring back `compilerOptions` for React to make it support JSX and DOM format.

Full `tsconfig.json`

``` JSON
{
  "extends": "./node_modules/gts/tsconfig-google.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "build",
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react"
  },
  "include": [
    "src"
  ]
}
```

You can edit `compilerOptions` rules by yourself and you can `cat ./node_modules/gts/tsconfig-google.json` to view GTS current setting.

## Installing eslint-plugin-react

GTS will create you the `.eslintrc.json` file but the default rules is not support for React App.

You can view the current GTS ESLint config by `cat ./node_modules/gts/.eslintrc.json`.

This step is how to add React plugin for ESLint.

Install `eslint-plugin-react` Eslint Plugin.

``` Bash
npm install eslint-plugin-react --save-dev
```

Add `"plugin:react/recommended"` to extends to load the plugin.

Add the following `env` config.

`"browser": true` to allow browser JavaScript (window, document).

`"jest": true` to allow Global Jest script.

Full `.eslintrc.json`

``` JSON
{
  "extends": [
    "./node_modules/gts/",
    "plugin:react/recommended"
  ],
  "env": {
    "browser": true,
    "jest": true
  }
}
```

## Fix ESLint and TSConfig

If you're using VS Code with ESLint Extension you'll see errors in your code.

You can run `npx gts check` or `npm run check` to check current ESLint and TypeScript error

For automatic fix code format you can use `npx gts fix` or `npm run fix`. But for some error you need to fix it yourself because sometimes auto format is not support a type of ESLint error.

## Add Husky and Git pre-commit

To make sure you and your team will not put a dirty code to git. You'll need Husky to make Git pre-commit to check before you commit.

Install Husky dependency

``` Bash
npm install husky --save-dev
```

And then add husky hook command to `package.json`

``` JSON
{
  "husky": {
    "hooks": {
      "pre-commit": "gts check",
    }
  }
}
```

Now every time you commit It will run `gts check` command before you commit and it will fail if there's an error.

Done! Enjoy your code.

## Reference

<https://github.com/google/gts>
