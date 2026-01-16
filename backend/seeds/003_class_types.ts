import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex.raw('TRUNCATE TABLE class_types CASCADE');
  
  // Insert sample class types
  const classTypes = [
    {
      id: knex.raw('uuid_generate_v4()'),
      name: 'Hatha Yoga',
      description: 'A gentle form of yoga that focuses on static postures and breathing exercises. Perfect for beginners and those seeking relaxation.',
      duration: 60,
      max_capacity: 20,
      difficulty_level: 'beginner',
      category: 'yoga',
      price: 25.00,
      color_code: '#8B5CF6',
      requirements: ['Yoga mat', 'Comfortable clothing'],
      benefits: [
        'Improved flexibility',
        'Stress reduction',
        'Better posture',
        'Enhanced mindfulness'
      ],
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      name: 'Vinyasa Flow',
      description: 'Dynamic yoga practice linking breath with movement. Builds strength, flexibility, and focus through flowing sequences.',
      duration: 75,
      max_capacity: 25,
      difficulty_level: 'intermediate',
      category: 'yoga',
      price: 30.00,
      color_code: '#10B981',
      requirements: ['Yoga mat', 'Water bottle', 'Towel'],
      benefits: [
        'Increased strength',
        'Improved coordination',
        'Cardiovascular health',
        'Mental clarity'
      ],
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      name: 'HIIT Training',
      description: 'High-intensity interval training combining cardio and strength exercises. Burn calories and build muscle efficiently.',
      duration: 45,
      max_capacity: 15,
      difficulty_level: 'advanced',
      category: 'fitness',
      price: 35.00,
      color_code: '#EF4444',
      requirements: ['Workout clothes', 'Water bottle', 'Towel'],
      benefits: [
        'Fat burning',
        'Muscle building',
        'Improved endurance',
        'Time-efficient workout'
      ],
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      name: 'Pilates Mat',
      description: 'Core-focused workout emphasizing controlled movements, proper breathing, and body alignment.',
      duration: 50,
      max_capacity: 18,
      difficulty_level: 'beginner',
      category: 'pilates',
      price: 28.00,
      color_code: '#F59E0B',
      requirements: ['Exercise mat', 'Comfortable clothing'],
      benefits: [
        'Core strength',
        'Better posture',
        'Improved balance',
        'Injury prevention'
      ],
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      name: 'Meditation & Mindfulness',
      description: 'Guided meditation sessions focusing on breath awareness, body scan, and mindfulness practices.',
      duration: 30,
      max_capacity: 30,
      difficulty_level: 'beginner',
      category: 'wellness',
      price: 20.00,
      color_code: '#6366F1',
      requirements: ['Comfortable clothing', 'Optional: meditation cushion'],
      benefits: [
        'Stress reduction',
        'Improved focus',
        'Better sleep',
        'Emotional balance'
      ],
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      name: 'Dance Fitness',
      description: 'Fun, energetic dance workout combining various dance styles with fitness movements. Great cardio workout!',
      duration: 60,
      max_capacity: 25,
      difficulty_level: 'intermediate',
      category: 'fitness',
      price: 32.00,
      color_code: '#EC4899',
      requirements: ['Comfortable workout clothes', 'Dance sneakers or bare feet', 'Water bottle'],
      benefits: [
        'Cardiovascular fitness',
        'Coordination improvement',
        'Mood boost',
        'Full-body workout'
      ],
      is_active: true
    }
  ];

  await knex('class_types').insert(classTypes);
}