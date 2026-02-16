#!/usr/bin/env node
/**
 * Generates EMOJI_SEARCH_TERMS: a pipe-separated string of search keywords,
 * one segment per emoji in EMOJI_LIST (same order). Run and paste output into editor.js.
 */
const fs = require('fs');
const js = fs.readFileSync('./js/editor.js', 'utf8');
const listMatch = js.match(/const EMOJI_LIST = \[([\s\S]*?)\];/);
const list = listMatch[1].split(',').map(s => s.trim().replace(/^'|'$/g, ''));

// Unicode/CLDR-style short names for each emoji (same order as EMOJI_LIST)
// Generated to be searchable - multi-word phrases
const names = [
  'grinning smile happy', 'grin big eyes smile', 'grin smiling eyes', 'beaming smile', 'grinning sweat',
  'tears joy laugh', 'rofl rolling floor', 'slight smile', 'upside down face', 'wink',
  'blush smile', 'halo angel', 'smiling hearts love', 'heart eyes love', 'star struck',
  'kiss blowing', 'yummy savoring food', 'tongue winking', 'zany silly', 'cool sunglasses',
  'thinking face', 'eye roll', 'smirk', 'grimace', 'lying pinocchio',
  'relieved', 'silent face without mouth', 'neutral face', 'expressionless', 'hushed',
  'frowning open mouth', 'anguished', 'open mouth', 'astonished', 'flushed',
  'pleading puppy', 'cry tear', 'sob crying', 'triumph steam', 'angry',
  'rage angry', 'curse symbols mouth', 'devil smile horns', 'skull dead', 'poop pile',
  'thumbs up like', 'thumbs down', 'clap applause', 'raising hands', 'wave hand',
  'handshake deal', 'pray please', 'victory peace', 'cross fingers luck', 'love you gesture',
  'rock horns', 'point left', 'point right', 'point up', 'point down',
  'heart red love', 'orange heart', 'yellow heart', 'green heart', 'blue heart',
  'purple heart', 'black heart', 'white heart', 'broken heart', 'two hearts',
  'sparkling heart', 'growing heart', 'cupid arrow', 'star', 'sparkles shine',
  'fire flame hot', 'hundred points', 'dart target', 'trophy winner', 'pushpin pin',
  'art palette', 'movie film clapper', 'newspaper', 'music note', 'notes music',
  'microphone mic', 'mic karaoke', 'phone mobile', 'laptop computer', 'desktop computer',
  'camera', 'camera flash', 'link', 'paperclip', 'book open', 'memo note',
  'pencil', 'lock', 'key', 'light bulb', 'megaphone', 'bell',
  'seedling plant grow', 'herb leaf', 'clover lucky', 'blossom flower', 'flower',
  'sunflower', 'flower blossom', 'maple leaf', 'frog', 'arrow right',
  'arrow left', 'arrow up', 'arrow down', 'northeast', 'southeast',
  'check mark', 'cross mark', 'lightning bolt', 'megaphone loud', 'speech balloon',
  'anger symbol', 'thought balloon', 'clock time', 'calendar date', 'calendar spiral',
  'check button', 'ok button', 'cool button', 'new button', 'free button',
  'top button', 'back button', 'on button', 'soon button', 'vertical arrows',
  'arrows clockwise', 'fast forward', 'rewind', 'shuffle', 'repeat',
  'repeat one', 'dollar money', 'b button', 'o button', 'parking',
  'japanese discount', 'japanese free', 'japanese applicable', 'japanese monthly', 'japanese application',
  'japanese open', 'japanese bargain', 'japanese acceptable', 'copyright', 'registered',
  'trademark', 'gear settings', 'wrench', 'hammer tool', 'nut bolt',
  'pick mining', 'screwdriver', 'ruler triangle', 'ruler', 'scissors',
  'file box', 'file cabinet', 'trash', 'lock', 'unlock',
  'lock pen', 'lock key', 'key', 'hammer', 'axe',
  'pick', 'shield', 'pistol gun', 'bow arrow', 'boomerang',
  'shield', 'crystal ball', 'magic wand', 'prayer beads', 'nazar',
  'barber pole', 'alembic', 'telescope', 'microscope', 'hole',
  'xray', 'bandage', 'stethoscope', 'pill medicine', 'syringe',
  'blood drop', 'dna', 'virus', 'petri dish', 'test tube',
  'thermometer', 'broom', 'plunger', 'basket', 'tissue',
  'toilet', 'tap water', 'shower', 'bathtub', 'bath',
  'soap', 'toothbrush', 'razor', 'sponge', 'bucket',
  'lotion', 'bellhop bell', 'key', 'door', 'chair',
  'couch', 'bed', 'teddy bear', 'nesting doll', 'frame picture',
  'mirror', 'window', 'shopping bags', 'cart shopping', 'gift present',
  'balloon', 'carp streamer', 'ribbon', 'magic wand', 'piñata',
  'confetti', 'party', 'lantern', 'wind chime', 'red envelope',
  'envelope letter', 'inbox', 'outbox', 'email', 'love letter',
  'inbox tray', 'outbox tray', 'package', 'mouse trap', 'mailbox',
  'mailbox full', 'postbox', 'scroll', 'page', 'document',
  'bookmark tabs', 'receipt', 'chart', 'chart up', 'chart down',
  'notebook', 'calendar', 'date', 'trash', 'file',
  'file folder', 'folder', 'newspaper', 'notebook', 'ledger',
  'books', 'book', 'bookmark', 'safety pin', 'link',
  'paperclips', 'ruler', 'ruler', 'abacus', 'pushpin',
  'round pushpin', 'scissors', 'pen', 'fountain pen', 'black nib',
  'paintbrush', 'crayon', 'memo note', 'briefcase', 'file cabinet',
  'folder', 'folder', 'file box', 'ballot box', 'file cabinet',
  'pencil edit', 'lock', 'unlock',
  'bitcoin crypto', 'money bag', 'coin gold', 'diamond gem', 'rocket space',
  'moon crescent', 'bull market', 'bear market', 'brick block', 'card credit',
  'bank', 'dollar', 'yen', 'euro', 'pound', 'crab', 'house home',
  'orange circle', 'heart orange'
];

// Pad so length matches list
while (names.length < list.length) names.push('symbol icon ' + names.length);
const out = names.slice(0, list.length).join('|');
console.log('// Pipe-separated search terms, one per EMOJI_LIST item (same order):');
console.log('const EMOJI_SEARCH_TERMS = "' + out.replace(/"/g, '\\"') + '".split("|");');
