// Default game content. Sample survey values (the PPT's were samples too) —
// edit them in /admin. Answers are listed top-ranked first.

export const DEFAULT_CONFIG = {
  version: 1,
  title: 'Anime Matsuri',
  subtitle: 'Sakura & Spirits',
  season: 'Anime Matsuri Season 2',
  teams: ['Sakura', 'Spirits'],

  // Main-game lineup: question id from the bank + point multiplier.
  rounds: [
    { qid: 'r-recognize', mult: 1, label: 'Single Points' },
    { qid: 'r-opening',   mult: 2, label: 'Double Points' },
    { qid: 'r-couple',    mult: 2, label: 'Double Points' },          // NEW (replaces "power you'd want")
    { qid: 'r-roommate',  mult: 3, label: 'Triple Points' },
    { qid: 'r-teacher',   mult: 3, label: 'Triple Points' },          // NEW (replaces "made viewers cry")
    { qid: 'r-female',    mult: 3, label: 'Anime Matsuri Special' },  // NEW (replaces "world to visit", a repeat of FM Q5)
  ],

  fastMoney: {
    qids: ['fm-never', 'fm-pokemon', 'fm-food', 'fm-hair', 'fm-world'], // fm-pokemon is NEW (replaces "anime weapon")
    target: 200,
    players: 2,           // classic Fast Money: 2 players, 2nd can't repeat the 1st
    timers: [20, 25],     // seconds for player 1 / player 2
    countsToScore: true,  // add Fast Money points to the team's total
    bonus: 0,             // extra points for reaching the target
  },

  bank: [
    // ---------- Main-game rounds ----------
    { id: 'r-recognize', kind: 'round', q: 'Name an anime character everyone recognizes.', answers: [
      ['Naruto', 24], ['Goku', 21], ['Pikachu', 17], ['Luffy', 13], ['Gojo', 9], ['Sailor Moon', 7], ['Tanjiro', 5], ['Anya', 4] ] },
    { id: 'r-opening', kind: 'round', q: 'Name an anime opening song people instantly recognize.', answers: [
      ['Blue Bird — Naruto', 22], ['Gurenge — Demon Slayer', 18], ['We Are! — One Piece', 15], ['Cha-La Head-Cha-La — Dragon Ball Z', 14],
      ['Pokémon Theme', 11], ['The Rumbling — Attack on Titan', 8], ['Silhouette — Naruto', 7], ['Idol — Oshi no Ko', 5] ] },
    { id: 'r-couple', kind: 'round', isNew: true, q: 'Name a famous anime couple.', answers: [
      ['Naruto & Hinata', 22], ['Kirito & Asuna', 18], ['Goku & Chi-Chi', 14], ['Taki & Mitsuha — Your Name', 12],
      ['Loid & Yor — Spy x Family', 11], ['Inuyasha & Kagome', 8], ['Usagi & Mamoru — Sailor Moon', 7], ['Ichigo & Orihime', 5] ] },
    { id: 'r-teacher', kind: 'round', isNew: true, q: 'Name the best anime teacher or mentor.', answers: [
      ['Kakashi', 23], ['Gojo', 19], ['Koro-sensei', 15], ['All Might', 13],
      ['Jiraiya', 10], ['Master Roshi', 8], ['Urokodaki', 6], ['Onizuka — GTO', 5] ] },
    { id: 'r-pokemon', kind: 'round', isNew: true, q: 'Name a popular Pokémon.', answers: [
      ['Pikachu', 30], ['Charizard', 18], ['Eevee', 13], ['Mewtwo', 10],
      ['Gengar', 8], ['Snorlax', 7], ['Lucario', 5], ['Bulbasaur', 4] ] },
    { id: 'r-female', kind: 'round', isNew: true, q: 'Name the best female anime character.', answers: [
      ['Mikasa', 20], ['Nezuko', 16], ['Sailor Moon', 13], ['Hinata', 12],
      ['Erza Scarlet', 10], ['Nami', 9], ['Yor Forger', 8], ['Frieren', 6] ] },
    { id: 'r-roommate', kind: 'round', q: 'Name an anime character you would want as a roommate.', answers: [
      ['Anya', 21], ['Gojo', 18], ['Luffy', 14], ['Tanjiro', 13], ['Frieren', 11], ['Senku', 9], ['Denji', 8], ['Saitama', 6] ] },
    // Original PPT rounds kept as alternates (swapped out of the default lineup).
    { id: 'r-power', kind: 'round', q: "Name an anime power or ability you'd want in real life.", answers: [
      ['Shadow Clone Jutsu', 21], ['Teleportation', 18], ['Flying Nimbus', 14], ['Infinity', 12],
      ['Titan Powers', 11], ['Super Saiyan', 10], ['Water Breathing', 8], ['Domain Expansion', 6] ] },
    { id: 'r-cry', kind: 'round', q: 'Name an anime that made viewers emotional or cry.', answers: [
      ['Your Lie in April', 20], ['Demon Slayer', 16], ['Attack on Titan', 15], ['Violet Evergarden', 13],
      ['Anohana', 11], ['Clannad', 9], ['Frieren', 8], ['Oshi no Ko', 8] ] },
    { id: 'r-world', kind: 'round', q: 'Name an anime world you would love to visit.', answers: [
      ['Pokémon', 20], ['One Piece', 17], ['Naruto', 14], ['Spirited Away', 12],
      ['Demon Slayer', 11], ['My Hero Academia', 10], ['Frieren', 9], ['Solo Leveling', 7] ] },

    // ---------- Fast Money ----------
    { id: 'fm-never', kind: 'fm', q: 'Name an anime character known for never giving up.', answers: [
      ['Naruto', 35], ['Luffy', 25], ['Tanjiro', 18], ['Goku', 12], ['Deku', 10] ] },
    { id: 'fm-pokemon', kind: 'fm', isNew: true, q: 'Name a popular Pokémon.', answers: [
      ['Pikachu', 38], ['Charizard', 20], ['Eevee', 14], ['Mewtwo', 10], ['Gengar', 8], ['Snorlax', 6] ] },
    { id: 'fm-food', kind: 'fm', q: 'Name an anime food you want to try.', answers: [
      ['Ramen', 30], ['Onigiri', 22], ['Dango', 18], ['Curry', 12], ['Senzu Bean', 10], ['Taiyaki', 8] ] },
    { id: 'fm-hair', kind: 'fm', q: 'Name an anime character with iconic hair.', answers: [
      ['Goku', 28], ['Naruto', 20], ['Gojo', 18], ['Inosuke', 12], ['Sailor Moon', 12], ['Sukuna', 10] ] },
    { id: 'fm-world', kind: 'fm', q: 'Name an anime world you would want to live in.', answers: [
      ['Pokémon', 28], ['One Piece', 22], ['Naruto', 18], ['My Hero Academia', 12], ['Frieren', 10], ['Demon Slayer', 10] ] },
    { id: 'fm-couple', kind: 'fm', isNew: true, q: 'Name a famous anime couple.', answers: [
      ['Naruto & Hinata', 32], ['Kirito & Asuna', 24], ['Goku & Chi-Chi', 16], ['Loid & Yor', 14], ['Inuyasha & Kagome', 8], ['Taki & Mitsuha', 6] ] },
    { id: 'fm-teacher', kind: 'fm', isNew: true, q: 'Name the best anime teacher.', answers: [
      ['Kakashi', 34], ['Gojo', 26], ['Koro-sensei', 16], ['All Might', 12], ['Jiraiya', 8], ['Master Roshi', 4] ] },
    { id: 'fm-female', kind: 'fm', isNew: true, q: 'Name the best female anime character.', answers: [
      ['Mikasa', 30], ['Nezuko', 22], ['Sailor Moon', 16], ['Hinata', 14], ['Erza Scarlet', 10], ['Nami', 8] ] },
  ],
};

export const RULES = [
  'Teams compete to guess the most popular survey answers.',
  'A face-off starts each round.',
  'The first team to reveal the higher-ranked answer gains control.',
  'The team may choose to PLAY or PASS.',
  'Teams receive up to three strikes.',
  'Correct answers earn points.',
  'Steals are allowed after three strikes.',
  'Points accumulate through all rounds.',
  'Fast Money serves as the final challenge.',
  'The highest total score wins.',
];
