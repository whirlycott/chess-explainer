import type { Lesson } from '../types';

export const thinking: Lesson[] = [
  {
    id: 'values',
    title: 'Piece Values & Loose Pieces',
    aka: 'Count attackers and defenders',
    category: 'thinking',
    level: 1,
    bigIdea:
      'Pieces have points: pawn 1, knight 3, bishop 3, rook 5, queen 9. A piece is safe only if it has enough defenders.',
    cues: [
      'A piece with no defender at all is "loose". Loose pieces drop off!',
      'Count how many of your pieces attack a target and how many enemy pieces defend it.',
      'If attackers are more than defenders, you can usually win it.',
    ],
    walkthrough: {
      fen: 'r5k1/ppp2ppp/2n5/4p3/8/5N2/PPP2PPP/4R1K1 w - - 0 1',
      steps: [
        {
          say: "Look at Black's pawn in the middle. Two White pieces attack it: the knight and the rook. Only one Black piece defends it: the knight.",
          arrows: [['f3', 'e5', 'green'], ['e1', 'e5', 'green'], ['c6', 'e5', 'red']],
          highlights: ['e5'],
        },
        {
          san: 'Nxe5',
          predict: 'Two attackers, one defender. Can you win the pawn?',
          say: 'White takes the pawn with the knight. If Black takes back, White takes again.',
          arrows: [['c6', 'e5', 'red']],
        },
        {
          san: 'Nxe5',
          say: "Black's knight takes White's knight. So far it is an even trade: a knight for a knight.",
        },
        {
          san: 'Rxe5',
          say: 'The rook takes last, and Black has nothing left to take back with. White is a pawn ahead.',
          highlights: ['e5'],
        },
        {
          say: 'Here is the rule: the side with more attackers wins the fight. When the numbers are equal, think twice before you take.',
        },
      ],
    },
    explain: {
      q: 'Why did White win a pawn here?',
      choices: [
        'White had two attackers and Black had only one defender.',
        'Knights are always worth more than pawns.',
        'White moved first, so White always wins trades.',
      ],
      answer: 0,
      why: 'Two attackers against one defender means White gets the last capture.',
    },
    mistake:
      'Taking a piece without counting. If the target has as many defenders as you have attackers, you may just lose your piece.',
    puzzles: [
      {
        fen: '6k1/ppp2ppp/8/8/3n4/2N5/PPP2PPP/3Q2K1 w - - 0 1',
        prompt: 'One Black piece is loose. Grab it!',
        lines: [['Qxd4']],
        hints: ['Which Black piece has no defenders?', 'Look straight up the d-file from your queen.'],
        explanation: "Black's knight had no defenders, so your queen takes it for free.",
        kind: 'tactic',
      },
      {
        fen: '6k1/ppp2ppp/8/3p4/4n3/2NB4/PPP2PPP/6K1 w - - 0 1',
        prompt: 'Count attackers and defenders on the Black knight. Win material!',
        lines: [['Bxe4'], ['Nxe4']],
        hints: ['The knight on e4 is attacked twice.', 'It is defended only once, by a pawn.'],
        explanation:
          'Two attackers beat one defender. After the pawn takes back, you take again and stay a pawn ahead.',
        kind: 'tactic',
      },
    ],
    check: {
      q: 'Which trade is GOOD for you?',
      choices: [
        'Your knight for their rook',
        'Your rook for their bishop',
        'Your queen for their rook',
        'Your bishop for their pawn',
      ],
      answer: 0,
      why: 'A knight is worth 3 and a rook is worth 5, so you gain 2 points.',
    },
  },
  {
    id: 'cct',
    title: 'Checks, Captures, Threats',
    aka: 'The blunder check',
    category: 'thinking',
    level: 1,
    bigIdea:
      'Before every move, look for all checks, then all captures, then all threats, for you and for your opponent.',
    cues: [
      'Every single move! Make it a habit, like looking both ways before crossing the street.',
      'Checks first: they force your opponent to answer right away.',
      'Then ask: what is my opponent threatening to do to me?',
    ],
    walkthrough: {
      fen: 'rn1qkbnr/ppp2ppp/4p3/3p4/6b1/2PPPN2/PP3PPP/RNBQKB1R w KQkq - 0 1',
      steps: [
        {
          say: "It is White's move. Instead of guessing, White runs the checklist: checks, captures, threats.",
        },
        {
          say: "Checks first. Can any White piece check the Black king? The queen can, on a4, through the open diagonal.",
          arrows: [['d1', 'a4', 'green'], ['a4', 'e8', 'yellow']],
        },
        {
          san: 'Qa4+',
          predict: 'Find a check that also attacks something.',
          say: "Check! And the queen also looks along the row at Black's bishop on g4. That bishop is loose.",
          arrows: [['a4', 'g4', 'red']],
          highlights: ['g4'],
        },
        {
          san: 'Nc6',
          say: 'Black must block the check first. There is no time to save the bishop.',
        },
        {
          san: 'Qxg4',
          say: 'White wins a whole bishop. The checklist found a move that guessing would have missed.',
        },
      ],
    },
    explain: {
      q: 'Why do we look at checks first?',
      choices: [
        'Checks force the opponent to respond, so they can win material right away.',
        'Checks are always the best move.',
        'You must give check whenever you can.',
      ],
      answer: 0,
      why: 'A check must be answered, so it can create a second threat your opponent has no time to stop.',
    },
    mistake:
      'Only looking at your own ideas. Always ask what your opponent threatens before you move.',
    puzzles: [
      {
        fen: 'r1bqkbnr/pppp2pp/4p3/1n6/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq - 0 1',
        prompt: 'Run the checklist. Start with checks!',
        lines: [['Qh5+']],
        hints: ['Which White piece can give check?', 'The queen checks from h5, and also looks along the fifth row.'],
        explanation: "Queen to h5 is check, and it also attacks the loose knight on b5. Black blocks the check and loses the knight.",
        kind: 'tactic',
      },
      {
        setup: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5',
        prompt: "Blunder check! What does White threaten? Stop it with the best move.",
        lines: [['d5']],
        hints: ['Two White pieces aim at your f7 pawn.', 'Block the bishop with a pawn in the center.'],
        explanation:
          "White's knight and bishop both attack f7. The pawn move to d5 blocks the bishop and fights for the center.",
        orientation: 'black',
        kind: 'plan',
      },
    ],
    check: {
      q: 'What is the correct order for the checklist?',
      choices: ['Checks, captures, threats', 'Threats, checks, captures', 'Captures, threats, checks', 'Any order is fine'],
      answer: 0,
      why: 'Checks are the most forcing, then captures, then threats.',
    },
  },
  {
    id: 'prophylaxis',
    title: 'Prophylaxis',
    aka: 'Stop their plan before it starts',
    category: 'thinking',
    level: 3,
    bigIdea: 'Ask "What does my opponent want to do?" and make a move that stops it.',
    cues: [
      'Your opponent has a strong move ready, like a pin or a check.',
      'Nothing urgent is happening, so you have time for a quiet move.',
      'A small pawn move can take away a key square.',
    ],
    walkthrough: {
      setup: '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O',
      steps: [
        {
          say: "This is a famous opening called the Ruy Lopez. Before moving, White asks: what does Black want? Black's bishop would love to go to g4 and pin the knight.",
          arrows: [['c8', 'g4', 'red'], ['g4', 'd1', 'red']],
          highlights: ['g4'],
        },
        {
          san: 'h3',
          predict: "Find a quiet pawn move that stops Black's idea.",
          say: 'The little pawn move takes the g4 square away. Now the pin is impossible.',
          highlights: ['g4'],
        },
        {
          san: 'Na5',
          say: 'Black needs a new plan, so the knight goes after the bishop.',
        },
        {
          san: 'Bc2',
          say: 'The bishop steps back to safety. White can now build a big center calmly.',
        },
        {
          say: 'Top players have played this exact pawn move thousands of times. Stopping a plan is often stronger than starting your own.',
        },
      ],
    },
    explain: {
      q: 'Why was the pawn move to h3 a good idea?',
      choices: [
        "It stopped Black's bishop from pinning the knight on g4.",
        'It attacked a Black piece.',
        'It opened a file for the rook.',
      ],
      answer: 0,
      why: 'Prophylaxis means preventing the opponent\'s plan. The pawn on h3 controls g4.',
    },
    mistake: 'Making "waiting" pawn moves that weaken your king when there is nothing to stop.',
    puzzles: [
      {
        setup: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O 7.Re1 a6',
        prompt: "Black's light-squared bishop wants to go to g4 and pin your knight. Stop it with one pawn move.",
        lines: [['h3']],
        hints: ['Which square does the bishop want?', 'A pawn on h3 controls g4.'],
        explanation: 'The pawn on h3 takes away g4, so the pin never happens.',
        kind: 'plan',
      },
      {
        fen: '3r2k1/ppR2ppp/8/8/8/8/PP3PPP/6K1 w - - 0 1',
        prompt: 'Black threatens something nasty on your back row. Give your king an escape square.',
        lines: [['h3'], ['g3'], ['h4']],
        hints: ["What happens if Black's rook goes to d1?", 'Move a pawn in front of your king to make "luft" (air).'],
        explanation: "Black threatened rook to d1, checkmate. A pawn move gives your king a square to escape to.",
        kind: 'plan',
      },
    ],
    check: {
      q: 'What question should you ask to play prophylaxis?',
      choices: ['What does my opponent want to do?', 'Which piece is worth the most?', 'Can I trade queens?', 'How fast can I castle?'],
      answer: 0,
      why: 'Prophylaxis starts by understanding your opponent\'s plan.',
    },
  },
];
