import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex.raw('TRUNCATE TABLE instructors CASCADE');
  
  // Insert sample instructors
  const instructors = [
    {
      id: knex.raw('uuid_generate_v4()'),
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@histudio.com',
      phone: '+1234567892',
      bio: 'Certified yoga instructor with 8+ years of experience. Specializes in Hatha and Vinyasa yoga.',
      specialties: ['Yoga', 'Meditation', 'Breathwork'],
      certifications: [
        'RYT-500 Yoga Alliance',
        'Meditation Teacher Training',
        'Prenatal Yoga Certification'
      ],
      experience_years: 8,
      hourly_rate: 75.00,
      avatar_url: null,
      social_links: {
        instagram: '@sarahyogaflow',
        website: 'www.sarahyoga.com'
      },
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      first_name: 'Michael',
      last_name: 'Chen',
      email: 'michael.chen@histudio.com',
      phone: '+1234567893',
      bio: 'Former professional dancer turned fitness instructor. Expert in high-energy workouts and functional training.',
      specialties: ['HIIT', 'Dance Fitness', 'Functional Training'],
      certifications: [
        'NASM Certified Personal Trainer',
        'Group Fitness Instructor',
        'TRX Suspension Training'
      ],
      experience_years: 5,
      hourly_rate: 80.00,
      avatar_url: null,
      social_links: {
        instagram: '@mikefitnessco'
      },
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      first_name: 'Emma',
      last_name: 'Williams',
      email: 'emma.williams@histudio.com',
      phone: '+1234567894',
      bio: 'Pilates expert with a background in physical therapy. Focuses on rehabilitation and core strengthening.',
      specialties: ['Pilates', 'Core Training', 'Rehabilitation'],
      certifications: [
        'Romana\'s Pilates Certification',
        'Physical Therapy License',
        'BASI Pilates Comprehensive'
      ],
      experience_years: 12,
      hourly_rate: 85.00,
      avatar_url: null,
      social_links: {
        linkedin: 'emma-williams-pt'
      },
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      first_name: 'David',
      last_name: 'Brown',
      email: 'david.brown@histudio.com',
      phone: '+1234567895',
      bio: 'Mindfulness and meditation teacher with a calm, grounding presence. Helps students find inner peace.',
      specialties: ['Meditation', 'Mindfulness', 'Restorative Yoga'],
      certifications: [
        'Mindfulness-Based Stress Reduction (MBSR)',
        'Meditation Teacher Training',
        'Yin Yoga Certification'
      ],
      experience_years: 6,
      hourly_rate: 70.00,
      avatar_url: null,
      social_links: {
        website: 'www.mindfulnesswithdavid.com'
      },
      is_active: true
    }
  ];

  await knex('instructors').insert(instructors);
}