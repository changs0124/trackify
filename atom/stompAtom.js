import { atom } from "jotai";

export const myPresenceAtom = atom(null);
export const otherPresenceAtom = atom({});

export const socketStatusAtom = atom("connecting");

export const publishAtom = atom(null);
export const workingAtom = atom(null);