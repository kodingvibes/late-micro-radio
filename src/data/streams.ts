import type { StreamInfo } from "@/global";

function streamUrlFor(name: string): string {
  if (typeof window === "undefined") return `/${name}`;
  return `${window.location.origin}/${name}`;
}

export const STREAMS: readonly StreamInfo[] = [
  { name: "groovesalad",   mount: "groovesalad",   url: streamUrlFor("groovesalad"),   category: "Groove Salad",         emoji: "\u263E", accent: "text-cyan-400" },
  { name: "dronezone",     mount: "dronezone",     url: streamUrlFor("dronezone"),     category: "Drone Zone",           emoji: "\u266A", accent: "text-amber-400" },
  { name: "fluid",         mount: "fluid",         url: streamUrlFor("fluid"),         category: "Fluid",                emoji: "\u25D0", accent: "text-purple-400" },
  { name: "indiepop",      mount: "indiepop",      url: streamUrlFor("indiepop"),      category: "Indie Pop",            emoji: "\u2665", accent: "text-pink-400" },
  { name: "u80s",          mount: "u80s",          url: streamUrlFor("u80s"),          category: "Underground 80s",      emoji: "\u266B", accent: "text-orange-400" },
  { name: "vaporwaves",    mount: "vaporwaves",    url: streamUrlFor("vaporwaves"),    category: "Vaporwaves",           emoji: "\u25E2", accent: "text-fuchsia-400" },
  { name: "metal",         mount: "metal",         url: streamUrlFor("metal"),         category: "Metal",                emoji: "\u266C", accent: "text-rose-400" },
  { name: "dubstep",       mount: "dubstep",       url: streamUrlFor("dubstep"),       category: "Dub Step",             emoji: "\u25E4", accent: "text-lime-400" },
  { name: "7soul",         mount: "7soul",         url: streamUrlFor("7soul"),         category: "7 Soul",               emoji: "\u266F", accent: "text-indigo-400" },
  { name: "beatblender",   mount: "beatblender",   url: streamUrlFor("beatblender"),   category: "Beat Blender",         emoji: "\u25CD", accent: "text-teal-400" },
  { name: "bootliquor",    mount: "bootliquor",    url: streamUrlFor("bootliquor"),    category: "Boot Liquor",          emoji: "\u26F0", accent: "text-amber-600" },
  { name: "doomed",        mount: "doomed",        url: streamUrlFor("doomed"),        category: "Doomed",               emoji: "\u2020", accent: "text-red-400" },
  { name: "illstreet",     mount: "illstreet",     url: streamUrlFor("illstreet"),     category: "Illinois Street Lounge", emoji: "\u231B", accent: "text-yellow-400" },
  { name: "lush",          mount: "lush",          url: streamUrlFor("lush"),          category: "Lush",                 emoji: "\u2740", accent: "text-pink-300" },
  { name: "poptron",       mount: "poptron",       url: streamUrlFor("poptron"),       category: "PopTron",              emoji: "\u25CE", accent: "text-sky-400" },
  { name: "secretagent",   mount: "secretagent",   url: streamUrlFor("secretagent"),   category: "Secret Agent",         emoji: "\u2302", accent: "text-slate-300" },
  { name: "suburbsofgoa",  mount: "suburbsofgoa",  url: streamUrlFor("suburbsofgoa"),  category: "Suburbs of Goa",       emoji: "\u25C8", accent: "text-emerald-400" },
  { name: "thetrip",       mount: "thetrip",       url: streamUrlFor("thetrip"),       category: "The Trip",             emoji: "\u27D0", accent: "text-violet-400" },
];
