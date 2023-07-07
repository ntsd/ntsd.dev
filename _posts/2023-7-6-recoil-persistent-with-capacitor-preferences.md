---
layout: post
title: "Persistent store for Cross-platform React applications with Recoil and Capacitor Preferences"
date: 2023-7-6
subtitle: "Make Recoil persistent for Cross-Platform React Applications. worked for iOS, Android, Website, and PWA."
catalog: true
categories:
  - Software Development
tags:
  - Mobile Development
  - Web Development
  - Recoil
  - Capacitor
  - React
  - Programming
  - Frontend
published: true
---

## Capacitor Preferences

[Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences) is a Capacitor plugin to allow Capacitor applications to store persistent data.

The Preferences API provides a simple key/value persistent store for lightweight data.

Mobile OSs may periodically clear data set in window.localStorage, so this API should be used instead. This API will fall back to using localStorage when running as a Progressive Web App.

This plugin will use UserDefaults on iOS and SharedPreferences on Android. Stored data is cleared if the app is uninstalled.

## Custom Recoil Atom Effect

The customize for Atom Effect to store data in Capacitor Preferences instead of Memory for persistent data.

This code makes customized to get, set, and remove the data by the store key.

* Instead of Capacitor Preferences you can replace with any Library you want.

```javascript
import { Preferences } from "@capacitor/preferences";
import { AtomEffect } from "recoil";

export const persistentStorageEffect = <T>(key: string): AtomEffect<T> => {
  return ({ setSelf, onSet, trigger }) => {
    const loadPersisted = async () => {
      const getResult = await Preferences.get({ key });

      if (getResult.value != null) {
        setSelf(JSON.parse(getResult.value));
      }
    };

    if (trigger === "get") {
      loadPersisted();
    }

    onSet((newValue, _, isReset) => {
      if (isReset) {
        Preferences.remove({ key });
      } else {
        Preferences.set({ key, value: JSON.stringify(newValue) });
      }
    });
  };
};
```

## How to use the Atom Effect

You can simply put it in the Atom Options on effects parameters, you can also put other effects as well.

```javascript
import { atom } from "recoil";
import { persistentStorageEffect } from "./utils";
import type { Settings } from "../types";

export const settingsState = atom<Settings>({
  key: "settings",
  default: {
    darkMode: true,
  },
  effects: [persistentStorageEffect<Settings>("settings")],
});
```
