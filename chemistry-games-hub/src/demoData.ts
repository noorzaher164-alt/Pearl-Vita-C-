import type { Folder, Game } from './types';

export const DEMO_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Organic Chemistry', color: '#c084fc', icon: '🧪', createdAt: '2024-01-10T10:00:00Z' },
  { id: 'f2', name: 'Chemical Equilibrium', color: '#7dd3fc', icon: '⚖️', createdAt: '2024-01-11T10:00:00Z' },
  { id: 'f3', name: 'Thermodynamics', color: '#fde68a', icon: '🔥', createdAt: '2024-01-12T10:00:00Z' },
  { id: 'f4', name: 'Acids and Bases', color: '#6ee7b7', icon: '🧫', createdAt: '2024-01-13T10:00:00Z' },
  { id: 'f5', name: 'Electrochemistry', color: '#fca5a5', icon: '⚡', createdAt: '2024-01-14T10:00:00Z' },
];

export const DEMO_GAMES: Game[] = [
  {
    id: 'g1',
    title: 'Organic Basics Quiz',
    folderId: 'f1',
    lessonName: 'Introduction to Organic Chemistry',
    gameType: 'quiz',
    isCompetitive: true,
    createdAt: '2024-01-15T10:00:00Z',
    questions: [
      {
        id: 'q1',
        text: 'What is the general formula for alkanes?',
        choices: ['CₙH₂ₙ₊₂', 'CₙH₂ₙ', 'CₙH₂ₙ₋₂', 'CₙHₙ'],
        correctIndex: 0,
        explanation: 'Alkanes are saturated hydrocarbons with formula CₙH₂ₙ₊₂. They have only single bonds.'
      },
      {
        id: 'q2',
        text: 'Which functional group characterizes alcohols?',
        choices: ['-COOH', '-CHO', '-OH', '-NH₂'],
        correctIndex: 2,
        explanation: 'Alcohols contain the hydroxyl (-OH) functional group attached to a carbon atom.'
      },
      {
        id: 'q3',
        text: 'What type of reaction converts alkenes to alkanes?',
        choices: ['Substitution', 'Hydrogenation', 'Elimination', 'Oxidation'],
        correctIndex: 1,
        explanation: 'Hydrogenation adds H₂ across a double bond, converting alkenes to alkanes.'
      },
      {
        id: 'q4',
        text: 'What is the IUPAC name for CH₃CH₂CH₂CH₃?',
        choices: ['Butane', 'Propane', 'Pentane', 'Ethane'],
        correctIndex: 0,
        explanation: 'CH₃CH₂CH₂CH₃ has 4 carbon atoms in the main chain, making it butane.'
      },
      {
        id: 'q5',
        text: 'Which compound is an ester?',
        choices: ['CH₃COOH', 'CH₃COOC₂H₅', 'CH₃CHO', 'CH₃OH'],
        correctIndex: 1,
        explanation: 'CH₃COOC₂H₅ (ethyl ethanoate) is an ester formed from an acid and an alcohol.'
      },
    ]
  },
  {
    id: 'g2',
    title: 'Equilibrium Flashcards',
    folderId: 'f2',
    lessonName: 'Le Chatelier\'s Principle',
    gameType: 'flash-cards',
    isCompetitive: false,
    createdAt: '2024-01-16T10:00:00Z',
    questions: [
      {
        id: 'q1',
        text: 'What does Le Chatelier\'s Principle state?',
        choices: [
          'A system at equilibrium will shift to oppose any change imposed on it',
          'Equilibrium can never be disturbed',
          'Temperature always increases at equilibrium',
          'Concentration of products always exceeds reactants'
        ],
        correctIndex: 0,
        explanation: 'Le Chatelier\'s Principle: if a system in equilibrium is disturbed, it shifts to counteract the change.'
      },
      {
        id: 'q2',
        text: 'If pressure is increased on a gas-phase reaction, the equilibrium shifts toward...',
        choices: ['The side with more moles of gas', 'The side with fewer moles of gas', 'No change occurs', 'The product side always'],
        correctIndex: 1,
        explanation: 'Increasing pressure favors the side with fewer moles of gas, reducing pressure.'
      },
      {
        id: 'q3',
        text: 'What is the expression for Kc for: aA + bB ⇌ cC + dD?',
        choices: ['[A]ᵃ[B]ᵇ / [C]ᶜ[D]ᵈ', '[C]ᶜ[D]ᵈ / [A]ᵃ[B]ᵇ', '[C][D] / [A][B]', '[A][B] / [C][D]'],
        correctIndex: 1,
        explanation: 'Kc = [products]^coefficients / [reactants]^coefficients'
      },
    ]
  },
  {
    id: 'g3',
    title: 'Enthalpy & Entropy Battle',
    folderId: 'f3',
    lessonName: 'Thermodynamics Concepts',
    gameType: 'quiz',
    isCompetitive: true,
    createdAt: '2024-01-17T10:00:00Z',
    questions: [
      {
        id: 'q1',
        text: 'What does a negative ΔH value indicate?',
        choices: ['Endothermic reaction', 'Exothermic reaction', 'No energy change', 'Entropy increase'],
        correctIndex: 1,
        explanation: 'Negative ΔH means heat is released to surroundings — the reaction is exothermic.'
      },
      {
        id: 'q2',
        text: 'The standard enthalpy of formation of an element in its standard state is:',
        choices: ['1 kJ/mol', '-1 kJ/mol', '0 kJ/mol', 'Undefined'],
        correctIndex: 2,
        explanation: 'By definition, ΔHf° of any element in its standard state = 0 kJ/mol.'
      },
      {
        id: 'q3',
        text: 'What is entropy a measure of?',
        choices: ['Heat content', 'Disorder or randomness of a system', 'Pressure', 'Temperature'],
        correctIndex: 1,
        explanation: 'Entropy (S) measures the degree of disorder or randomness in a system.'
      },
      {
        id: 'q4',
        text: 'The second law of thermodynamics states that:',
        choices: ['Energy is conserved', 'Entropy of the universe always increases', 'Temperature is constant', 'Pressure decreases'],
        correctIndex: 1,
        explanation: 'The second law: in any spontaneous process, total entropy of the universe increases.'
      },
    ]
  },
  {
    id: 'g4',
    title: 'Acids & Bases Match',
    folderId: 'f4',
    lessonName: 'pH and Buffers',
    gameType: 'match-up',
    isCompetitive: false,
    createdAt: '2024-01-18T10:00:00Z',
    questions: [
      {
        id: 'q1',
        text: 'What is the pH of a neutral solution at 25°C?',
        choices: ['0', '7', '14', '3'],
        correctIndex: 1,
        explanation: 'At 25°C, neutral water has pH = 7, where [H⁺] = [OH⁻] = 10⁻⁷ M.'
      },
      {
        id: 'q2',
        text: 'A strong acid:',
        choices: ['Partially dissociates', 'Completely dissociates in water', 'Has pH > 7', 'Does not react with water'],
        correctIndex: 1,
        explanation: 'Strong acids (like HCl, H₂SO₄) completely dissociate in aqueous solution.'
      },
      {
        id: 'q3',
        text: 'According to Brønsted-Lowry theory, an acid is:',
        choices: ['An electron pair acceptor', 'A proton donor', 'A proton acceptor', 'An electron pair donor'],
        correctIndex: 1,
        explanation: 'Brønsted-Lowry acids are proton (H⁺) donors; bases are proton acceptors.'
      },
    ]
  },
  {
    id: 'g5',
    title: 'Reaction Rates Challenge',
    folderId: 'f2',
    lessonName: 'Kinetics and Rates',
    gameType: 'quiz',
    isCompetitive: false,
    createdAt: '2024-01-19T10:00:00Z',
    questions: [
      {
        id: 'q1',
        text: 'For most reactions, increasing temperature increases the reaction rate.',
        choices: ['True', 'False', 'Sometimes', 'Never'],
        correctIndex: 0,
        explanation: 'True! For most reactions, higher temperature increases kinetic energy so more collisions exceed the activation energy. (Exceptions such as enzyme-catalysed reactions at very high temperatures exist but are not the general case.)'
      },
      {
        id: 'q2',
        text: 'A catalyst is consumed during a chemical reaction.',
        choices: ['True', 'False', 'Only sometimes', 'Only with metals'],
        correctIndex: 1,
        explanation: 'False! Catalysts are not consumed — they lower activation energy and are regenerated.'
      },
      {
        id: 'q3',
        text: 'Doubling the concentration always doubles the reaction rate.',
        choices: ['True', 'False', 'Only for zero-order reactions', 'Only for second-order'],
        correctIndex: 1,
        explanation: 'False! This is only true for first-order reactions. Rate dependence varies with reaction order.'
      },
      {
        id: 'q4',
        text: 'Surface area affects the rate of heterogeneous reactions.',
        choices: ['True', 'False', 'Only liquids', 'Only gases'],
        correctIndex: 0,
        explanation: 'True! Greater surface area means more contact between reactants, increasing collision frequency.'
      },
    ]
  },
];
