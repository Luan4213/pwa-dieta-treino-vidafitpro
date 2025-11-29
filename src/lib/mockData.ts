// Mock data for the FitPro app

export const mockUser = {
  id: '1',
  name: 'Alex Silva',
  email: 'alex@example.com',
  goal: 'Hipertrofia',
  level: 'Intermediário',
  streak: 12,
  weight: 75.2,
  targetWeight: 80,
  height: 175,
  age: 28,
  gender: 'M',
  activityLevel: 'Moderado',
  daysPerWeek: 5,
  sessionTime: 75,
  equipment: ['Academia completa'],
  preferences: ['Treino matinal', 'Foco em compostos'],
  joinDate: '2024-01-15',
  calories: { consumed: 1850, target: 2200 },
  macros: { 
    protein: { consumed: 120, target: 165 }, 
    carbs: { consumed: 180, target: 275 }, 
    fat: { consumed: 65, target: 85 } 
  },
  water: { consumed: 6, target: 8 },
  todayWorkout: {
    name: 'Peito e Tríceps',
    exercises: 6,
    duration: 75,
    completed: false
  }
}

export const mockWorkouts = [
  {
    id: '1',
    name: 'Peito e Tríceps',
    muscle: 'Peito',
    duration: 75,
    exercises: [
      { 
        id: '1',
        name: 'Supino Reto', 
        sets: 4, 
        reps: '8-10', 
        weight: 80, 
        rest: 120, 
        completed: false, 
        rpe: 0,
        muscle: 'Peito',
        equipment: 'Barra',
        instructions: 'Deite no banco, pegada na largura dos ombros, desça controlado até o peito',
        tips: 'Mantenha os pés firmes no chão e escápulas retraídas'
      },
      { 
        id: '2',
        name: 'Supino Inclinado', 
        sets: 4, 
        reps: '8-10', 
        weight: 70, 
        rest: 120, 
        completed: false, 
        rpe: 0,
        muscle: 'Peito Superior',
        equipment: 'Barra',
        instructions: 'Banco inclinado 30-45°, movimento similar ao supino reto',
        tips: 'Foque na contração da parte superior do peito'
      },
      { 
        id: '3',
        name: 'Crucifixo', 
        sets: 3, 
        reps: '10-12', 
        weight: 25, 
        rest: 90, 
        completed: false, 
        rpe: 0,
        muscle: 'Peito',
        equipment: 'Halteres',
        instructions: 'Movimento de abertura, braços ligeiramente flexionados',
        tips: 'Sinta o alongamento no peito, não desça demais'
      },
      { 
        id: '4',
        name: 'Paralelas', 
        sets: 3, 
        reps: '8-10', 
        weight: 0, 
        rest: 90, 
        completed: false, 
        rpe: 0,
        muscle: 'Peito Inferior',
        equipment: 'Peso Corporal',
        instructions: 'Desça até sentir alongamento no peito, suba controlado',
        tips: 'Incline o tronco para frente para focar no peito'
      },
      { 
        id: '5',
        name: 'Tríceps Testa', 
        sets: 3, 
        reps: '10-12', 
        weight: 35, 
        rest: 90, 
        completed: false, 
        rpe: 0,
        muscle: 'Tríceps',
        equipment: 'Barra W',
        instructions: 'Cotovelos fixos, movimento apenas do antebraço',
        tips: 'Não mova os cotovelos, foque na contração do tríceps'
      },
      { 
        id: '6',
        name: 'Tríceps Corda', 
        sets: 3, 
        reps: '12-15', 
        weight: 40, 
        rest: 60, 
        completed: false, 
        rpe: 0,
        muscle: 'Tríceps',
        equipment: 'Cabo',
        instructions: 'Puxe a corda para baixo, abra as pontas no final',
        tips: 'Mantenha cotovelos colados ao corpo'
      }
    ]
  },
  {
    id: '2',
    name: 'Costas e Bíceps',
    muscle: 'Costas',
    duration: 80,
    exercises: [
      { 
        id: '7',
        name: 'Barra Fixa', 
        sets: 4, 
        reps: '6-8', 
        weight: 0, 
        rest: 120, 
        completed: false, 
        rpe: 0,
        muscle: 'Latíssimo',
        equipment: 'Peso Corporal'
      },
      { 
        id: '8',
        name: 'Remada Curvada', 
        sets: 4, 
        reps: '8-10', 
        weight: 70, 
        rest: 120, 
        completed: false, 
        rpe: 0,
        muscle: 'Romboides',
        equipment: 'Barra'
      },
      { 
        id: '9',
        name: 'Puxada Frontal', 
        sets: 3, 
        reps: '10-12', 
        weight: 60, 
        rest: 90, 
        completed: false, 
        rpe: 0,
        muscle: 'Latíssimo',
        equipment: 'Cabo'
      },
      { 
        id: '10',
        name: 'Rosca Direta', 
        sets: 3, 
        reps: '10-12', 
        weight: 30, 
        rest: 90, 
        completed: false, 
        rpe: 0,
        muscle: 'Bíceps',
        equipment: 'Barra'
      }
    ]
  }
]

export const mockMeals = [
  { 
    id: '1',
    name: 'Café da Manhã', 
    time: '07:00',
    calories: 450, 
    protein: 25, 
    carbs: 45, 
    fat: 18, 
    completed: true,
    foods: [
      { name: 'Aveia', amount: '50g', calories: 190, protein: 7, carbs: 32, fat: 3 },
      { name: 'Banana', amount: '1 média', calories: 105, protein: 1, carbs: 27, fat: 0 },
      { name: 'Whey Protein', amount: '30g', calories: 120, protein: 24, carbs: 2, fat: 1 },
      { name: 'Amendoim', amount: '15g', calories: 85, protein: 4, carbs: 3, fat: 7 }
    ]
  },
  { 
    id: '2',
    name: 'Lanche da Manhã', 
    time: '10:00',
    calories: 200, 
    protein: 20, 
    carbs: 15, 
    fat: 8, 
    completed: true,
    foods: [
      { name: 'Iogurte Grego', amount: '150g', calories: 130, protein: 15, carbs: 9, fat: 5 },
      { name: 'Castanha do Pará', amount: '10g', calories: 70, protein: 1, carbs: 1, fat: 7 }
    ]
  },
  { 
    id: '3',
    name: 'Almoço', 
    time: '12:30',
    calories: 650, 
    protein: 45, 
    carbs: 60, 
    fat: 22, 
    completed: true,
    foods: [
      { name: 'Peito de Frango', amount: '150g', calories: 250, protein: 47, carbs: 0, fat: 5 },
      { name: 'Arroz Integral', amount: '80g', calories: 280, protein: 6, carbs: 58, fat: 2 },
      { name: 'Brócolis', amount: '100g', calories: 25, protein: 3, carbs: 5, fat: 0 },
      { name: 'Azeite', amount: '10ml', calories: 90, protein: 0, carbs: 0, fat: 10 }
    ]
  },
  { 
    id: '4',
    name: 'Lanche da Tarde', 
    time: '15:30',
    calories: 300, 
    protein: 25, 
    carbs: 20, 
    fat: 12, 
    completed: false,
    foods: [
      { name: 'Batata Doce', amount: '100g', calories: 86, protein: 2, carbs: 20, fat: 0 },
      { name: 'Whey Protein', amount: '30g', calories: 120, protein: 24, carbs: 2, fat: 1 },
      { name: 'Pasta de Amendoim', amount: '15g', calories: 94, protein: 4, carbs: 3, fat: 8 }
    ]
  },
  { 
    id: '5',
    name: 'Jantar', 
    time: '19:00',
    calories: 550, 
    protein: 40, 
    carbs: 35, 
    fat: 20, 
    completed: false,
    foods: [
      { name: 'Salmão', amount: '120g', calories: 250, protein: 35, carbs: 0, fat: 12 },
      { name: 'Batata Inglesa', amount: '150g', calories: 115, protein: 3, carbs: 26, fat: 0 },
      { name: 'Aspargos', amount: '100g', calories: 20, protein: 2, carbs: 4, fat: 0 },
      { name: 'Azeite', amount: '10ml', calories: 90, protein: 0, carbs: 0, fat: 10 }
    ]
  },
  { 
    id: '6',
    name: 'Ceia', 
    time: '22:00',
    calories: 250, 
    protein: 20, 
    carbs: 15, 
    fat: 12, 
    completed: false,
    foods: [
      { name: 'Cottage', amount: '100g', calories: 98, protein: 11, carbs: 4, fat: 4 },
      { name: 'Aveia', amount: '20g', calories: 76, protein: 3, carbs: 13, fat: 1 },
      { name: 'Amêndoas', amount: '15g', calories: 87, protein: 3, carbs: 3, fat: 8 }
    ]
  }
]

export const mockExerciseLibrary = [
  {
    id: '1',
    name: 'Supino Reto',
    muscle: 'Peito',
    equipment: 'Barra',
    difficulty: 'Intermediário',
    instructions: 'Deite no banco, pegada na largura dos ombros, desça controlado até o peito e empurre para cima',
    tips: 'Mantenha os pés firmes no chão e escápulas retraídas',
    commonMistakes: 'Não arquear demais as costas, não bater a barra no peito',
    videoUrl: 'https://example.com/supino-reto',
    tags: ['Peito', 'Força', 'Massa', 'Composto']
  },
  {
    id: '2',
    name: 'Agachamento',
    muscle: 'Pernas',
    equipment: 'Barra',
    difficulty: 'Intermediário',
    instructions: 'Posicione a barra no trapézio, desça até 90° e suba controlado',
    tips: 'Mantenha o core contraído e joelhos alinhados com os pés',
    commonMistakes: 'Não inclinar o tronco para frente, não deixar os joelhos caírem para dentro',
    videoUrl: 'https://example.com/agachamento',
    tags: ['Pernas', 'Glúteos', 'Força', 'Composto']
  },
  {
    id: '3',
    name: 'Levantamento Terra',
    muscle: 'Costas',
    equipment: 'Barra',
    difficulty: 'Avançado',
    instructions: 'Pegue a barra com pegada mista, mantenha as costas retas e levante',
    tips: 'Inicie o movimento com as pernas, mantenha a barra próxima ao corpo',
    commonMistakes: 'Não arredondar as costas, não hiperextender no topo',
    videoUrl: 'https://example.com/terra',
    tags: ['Costas', 'Pernas', 'Força', 'Composto']
  }
]

export const mockFoodLibrary = [
  {
    id: '1',
    name: 'Peito de Frango',
    category: 'Proteína',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    portion: '100g',
    alternatives: ['Peito de Peru', 'Tilápia', 'Whey Protein'],
    tags: ['Proteína', 'Baixo Carboidrato', 'Magro']
  },
  {
    id: '2',
    name: 'Arroz Integral',
    category: 'Carboidrato',
    calories: 350,
    protein: 7,
    carbs: 72,
    fat: 2.2,
    fiber: 3.5,
    portion: '100g (cru)',
    alternatives: ['Batata Doce', 'Aveia', 'Quinoa'],
    tags: ['Carboidrato', 'Fibra', 'Energia']
  },
  {
    id: '3',
    name: 'Abacate',
    category: 'Gordura',
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    fiber: 7,
    portion: '100g',
    alternatives: ['Azeite', 'Castanhas', 'Amendoim'],
    tags: ['Gordura Boa', 'Fibra', 'Vitaminas']
  }
]

export const mockProgressData = {
  weight: [
    { date: '2024-01-01', value: 72.0 },
    { date: '2024-01-15', value: 73.5 },
    { date: '2024-02-01', value: 74.2 },
    { date: '2024-02-15', value: 75.2 }
  ],
  measurements: {
    chest: [
      { date: '2024-01-01', value: 100 },
      { date: '2024-02-15', value: 102 }
    ],
    arm: [
      { date: '2024-01-01', value: 37 },
      { date: '2024-02-15', value: 38 }
    ],
    waist: [
      { date: '2024-01-01', value: 83 },
      { date: '2024-02-15', value: 82 }
    ],
    thigh: [
      { date: '2024-01-01', value: 57 },
      { date: '2024-02-15', value: 58 }
    ]
  },
  workoutVolume: [
    { date: '2024-02-01', value: 8500 },
    { date: '2024-02-08', value: 9200 },
    { date: '2024-02-15', value: 8800 },
    { date: '2024-02-22', value: 9600 }
  ],
  photos: [
    { date: '2024-01-01', front: '/progress/front-1.jpg', side: '/progress/side-1.jpg', back: '/progress/back-1.jpg' },
    { date: '2024-02-01', front: '/progress/front-2.jpg', side: '/progress/side-2.jpg', back: '/progress/back-2.jpg' },
    { date: '2024-02-15', front: '/progress/front-3.jpg', side: '/progress/side-3.jpg', back: '/progress/back-3.jpg' }
  ]
}

export const mockWorkoutPlan = {
  name: 'Push Pull Legs',
  description: 'Divisão clássica para hipertrofia',
  frequency: 6,
  weeks: 8,
  schedule: [
    { day: 'Segunda', workout: 'Push (Peito, Ombro, Tríceps)' },
    { day: 'Terça', workout: 'Pull (Costas, Bíceps)' },
    { day: 'Quarta', workout: 'Legs (Pernas, Glúteos)' },
    { day: 'Quinta', workout: 'Push (Peito, Ombro, Tríceps)' },
    { day: 'Sexta', workout: 'Pull (Costas, Bíceps)' },
    { day: 'Sábado', workout: 'Legs (Pernas, Glúteos)' },
    { day: 'Domingo', workout: 'Descanso' }
  ]
}