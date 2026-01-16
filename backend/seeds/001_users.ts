import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex.raw('TRUNCATE TABLE users CASCADE');
  
  // Insert admin user
  const adminUser = {
    id: knex.raw('uuid_generate_v4()'),
    email: 'admin@histudio.com',
    password_hash: '$2b$10$rQw8h2BxvP6YqB5bY8tL6OGzw1n3KqMoAD5vK7xL9mN8p3QrSt4u6', // hashed 'admin123'
    first_name: 'Hi Studio',
    last_name: 'Admin',
    phone: '+1-555-0100',
    is_admin: true,
    is_active: true,
    preferred_language: 'en'
  };

  await knex('users').insert(adminUser);

  // Insert sample regular users
  const users = [
    {
      id: knex.raw('uuid_generate_v4()'),
      email: 'john.doe@example.com',
      password_hash: '$2b$10$rQw8h2BxvP6YqB5bY8tL6OGzw1n3KqMoAD5vK7xL9mN8p3QrSt4u6',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890',
      date_of_birth: '1990-05-15',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_phone: '+1234567891',
      fitness_goals: 'Build muscle and improve endurance',
      preferred_language: 'en',
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      email: 'marie.martin@example.com',
      password_hash: '$2b$10$rQw8h2BxvP6YqB5bY8tL6OGzw1n3KqMoAD5vK7xL9mN8p3QrSt4u6',
      first_name: 'Marie',
      last_name: 'Martin',
      phone: '+33123456789',
      date_of_birth: '1988-08-22',
      emergency_contact_name: 'Paul Martin',
      emergency_contact_phone: '+33123456788',
      fitness_goals: 'Improve flexibility and reduce stress',
      preferred_language: 'fr',
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      email: 'carlos.rodriguez@example.com',
      password_hash: '$2b$10$rQw8h2BxvP6YqB5bY8tL6OGzw1n3KqMoAD5vK7xL9mN8p3QrSt4u6',
      first_name: 'Carlos',
      last_name: 'Rodriguez',
      phone: '+34987654321',
      date_of_birth: '1992-03-10',
      emergency_contact_name: 'Ana Rodriguez',
      emergency_contact_phone: '+34987654322',
      fitness_goals: 'Maintain core strength and flexibility',
      preferred_language: 'es',
      is_active: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      email: 'test@test.test',
      password_hash: '$2b$10$K7L/33xTYmI.dJGD7Wf1HOyGa7QNqd9U8kEg8p3E8CuSuHBqv9UKS', // hashed 'test'
      first_name: 'Test',
      last_name: 'User',
      phone: '+1555000999',
      date_of_birth: '1995-01-01',
      emergency_contact_name: 'Test Contact',
      emergency_contact_phone: '+1555000998',
      fitness_goals: 'Testing the application',
      preferred_language: 'en',
      is_active: true
    }
  ];

  await knex('users').insert(users);
}