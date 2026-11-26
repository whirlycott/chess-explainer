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
    id: 'meet-threat',
    title: 'Meet the Threat',
    aka: 'Five answers to any attack',
    category: 'thinking',
    level: 1,
    bigIdea:
      'When your opponent attacks, you have five answers: move it, guard it, block the attack, take the attacker, or make a bigger threat.',
    cues: [
      'Your opponent just moved a piece that now attacks one of yours.',
      'One of your pieces is attacked more times than it is guarded.',
      'Two enemy pieces line up on the same target.',
    ],
    walkthrough: {
      setup: '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4',
      orientation: 'white',
      steps: [
        {
          say: 'Every time your opponent moves, ask one question: what does that move threaten? Then pick the best answer.',
        },
        {
          san: 'Nf6',
          say: "Black's knight attacks your pawn on e4. That is a threat.",
          arrows: [['f6', 'e4', 'red']],
        },
        {
          say: 'Your five answers: move it away, guard it, block the attack, take the attacker, or make a bigger threat of your own.',
          highlights: ['e4'],
        },
        {
          san: 'Nc3',
          predict: 'Guard the pawn on e4 with a piece that also develops.',
          alsoGood: ['Nxc6'],
          say: 'The knight guards the pawn and comes into the game. Guarding and developing at the same time!',
          arrows: [['c3', 'e4', 'green']],
        },
        {
          san: 'Bb4',
          say: 'A new threat. The bishop pins the knight that guards e4. If it takes the knight, the pawn on e4 has no guard left.',
          arrows: [['b4', 'c3', 'red']],
          highlights: ['e4'],
        },
        {
          san: 'Nxc6',
          say: 'White trades knights first. A bishop on d3 would block the queen from guarding the knight on d4, so the knight leaves.',
        },
        { san: 'bxc6', say: 'Black takes back.' },
        {
          san: 'Bd3',
          predict: 'Guard the pawn on e4 a second time.',
          say: 'Now the bishop guards the pawn safely. Two guards for one pawn.',
          arrows: [['d3', 'e4', 'green']],
        },
        {
          san: 'd5',
          say: 'Black attacks the pawn again, this time with a pawn.',
          arrows: [['d5', 'e4', 'red']],
        },
        {
          san: 'exd5',
          predict: 'This time, take the attacker!',
          alsoGood: ['e5'],
          say: 'White takes the attacking pawn. Removing the attacker solves the problem for good.',
        },
        {
          san: 'cxd5',
          say: 'Black takes back. Every threat was met with a different answer, and the game is balanced.',
        },
      ],
    },
    explain: {
      q: 'At the end, why did White take the pawn instead of guarding e4 a third time?',
      choices: [
        'Taking the attacker removes the threat for good.',
        'Pawns must always be captured.',
        'Guarding a pawn three times is against the rules.',
      ],
      answer: 0,
      why: 'Guarding only holds while the guards stay put. Taking the attacker ends the threat completely.',
    },
    mistake:
      'Picking the first answer you see. Check all five, and make sure that moving a piece away does not leave another piece unguarded.',
    puzzles: [
      {
        setup: '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nxe4 4.Qe2',
        prompt: "Your knight on e4 is attacked by White's queen. Meet the threat without losing your queen!",
        lines: [['Qe7']],
        hints: [
          'If your knight simply moves away, the White knight can jump with a discovered check.',
          'Guard the knight and block the line with your queen.',
        ],
        explanation:
          'The queen guards the knight and blocks the e-file. Moving the knight away would allow a discovered check that wins your queen.',
        orientation: 'black',
        kind: 'tactic',
      },
      {
        setup: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d4 exd4 5.e5',
        prompt: 'A pawn attacks your knight. Moving it is fine, but can you hit back at the same time?',
        lines: [['d5'], ['Ne4'], ['Ng4']],
        hints: ["Which White piece could you attack?", 'A pawn on d5 attacks the bishop on c4.'],
        explanation:
          "The pawn move to d5 makes a bigger threat: it attacks White's bishop, so White has no time to take your knight for free.",
        orientation: 'black',
        kind: 'plan',
      },
    ],
    check: {
      q: 'Your bishop is attacked by a pawn. Which of these is NOT a real answer?',
      choices: [
        'Move the bishop away',
        'Make a bigger threat somewhere else',
        'Ignore it and hope your opponent misses it',
        'Guard the bishop',
      ],
      answer: 2,
      why: 'Hoping is not a plan. Coaches call this "hope chess". Always answer the threat.',
    },
  },
  {
    id: 'escape-check',
    title: 'Escape from Check',
    aka: 'Capture, Block, Run',
    category: 'thinking',
    level: 1,
    bigIdea:
      'In check, there are only three ways out: capture the checking piece, block the line, or run with the king. Look at all three, then pick the best.',
    cues: [
      'Your king is in check.',
      'The checking piece might be loose, so first see if you can capture it.',
      'You can block only a queen, rook or bishop checking from a distance.',
    ],
    walkthrough: {
      setup: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.cxd4',
      orientation: 'white',
      steps: [
        {
          san: 'Bb4+',
          say: 'Check! The bishop attacks your king. You must deal with it right now.',
          arrows: [['b4', 'e1', 'red']],
        },
        {
          say: 'Three ways out: capture the checking piece, block the line, or run. Here nothing can capture the bishop.',
        },
        {
          say: 'Running to f1 is legal, but a king that moves can never castle. Blocking looks better.',
          highlights: ['f1'],
        },
        {
          san: 'Bd2',
          predict: 'Block the check with a piece that has not moved yet.',
          alsoGood: ['Nc3', 'Nbd2'],
          say: 'The bishop blocks the check. It is guarded, so a trade is fine.',
        },
        { san: 'Bxd2+', say: 'Black trades bishops, with check again.' },
        {
          san: 'Nbxd2',
          predict: 'Capture the checking bishop with a piece that also develops.',
          alsoGood: ['Qxd2'],
          say: 'The knight captures and develops at the same time. Capturing the checker is often the best escape.',
        },
        {
          san: 'd5',
          say: 'Black strikes at the center. White escaped both checks and can still castle.',
        },
      ],
    },
    explain: {
      q: 'Why did White block the first check instead of moving the king to f1?',
      choices: [
        'A king that moves loses the right to castle.',
        'Kings are not allowed to move when in check.',
        'Blocking always wins material.',
      ],
      answer: 0,
      why: 'Once the king moves, castling is gone for the whole game, so the king may get stuck in the middle.',
    },
    mistake:
      'Grabbing the first legal escape. Running is legal but often costs castling, and a careless block can lose the blocking piece.',
    puzzles: [
      {
        setup: '1.e4 e5 2.Bc4 Bc5 3.Bxf7+',
        prompt: 'Check! Find the best of the three escapes.',
        lines: [['Kxf7']],
        hints: ['Can anything capture the checking bishop?', 'Is that bishop guarded by any White piece?'],
        explanation: 'The bishop was loose. The king captures it, and Black is a whole piece ahead.',
        orientation: 'black',
        kind: 'tactic',
      },
      {
        setup: '1.e4 e5 2.Nf3 d6 3.Bb5+',
        prompt: 'Check! Block it, and attack something if you can.',
        lines: [['c6'], ['Bd7'], ['Nd7'], ['Nc6']],
        hints: ['A pawn, a knight or a bishop can block on c6 or d7.', 'A pawn on c6 blocks the check and attacks the bishop.'],
        explanation:
          'Blocking with the c-pawn stops the check and attacks the bishop, so White must move it again.',
        orientation: 'black',
        kind: 'plan',
      },
    ],
    check: {
      q: 'A knight gives check. Which escape is impossible?',
      choices: ['Capture the knight', 'Block the check', 'Move the king'],
      answer: 1,
      why: 'A knight jumps, so nothing can be put in its way. You can only capture it or run.',
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
