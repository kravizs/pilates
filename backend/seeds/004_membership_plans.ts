import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex.raw('TRUNCATE TABLE membership_plans CASCADE');
  
  // Insert sample membership plans
  const membershipPlans = [
    {
      id: knex.raw('uuid_generate_v4()'),
      name: 'Drop-in Class',
      description: 'Single class pass - perfect for trying out our studio or occasional visits.',
      price: 35.00,
      duration_type: 'unlimited',
      duration_value: null,
      class_credits: 1,
      guest_passes: 0,
      freeze_option: false,
      max_freeze_days: 0,
      enrollment_fee: 0,
      cancellation_fee: 0,
      terms_and_conditions: 'Valid for one class. Must be used within 30 days of purchase.',
      benefits: [
        'Access to any class',
        'First-time visitor discount available',
        'No commitment required'
      ],
      restrictions: [
        'Valid for 30 days from purchase',
        'Non-transferable',
        'No refunds'
      ],
      is_active: true,
      sort_order: 1
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      name: 'Monthly Unlimited',
      description: 'Unlimited classes for 30 days. Our most popular membership for regular practitioners.',
      price: 149.00,
      duration_type: 'monthly',
      duration_value: 1,
      class_credits: -1, // -1 means unlimited
      guest_passes: 2,
      freeze_option: true,
      max_freeze_days: 14,
      enrollment_fee: 25.00,
      cancellation_fee: 50.00,
      terms_and_conditions: 'Auto-renews monthly. 30-day notice required for cancellation. Freeze option available for up to 14 days per membership period.',
      benefits: [
        'Unlimited classes',
        '2 guest passes per month',
        'Priority booking',
        'Member-only events',
        'Freeze option available'
      ],
      restrictions: [
        'Auto-renewal required',
        'Guest passes expire monthly',
        'Maximum 14 freeze days per period'
      ],
      is_active: true,
      sort_order: 2
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      name: '10-Class Package',
      description: 'Package of 10 classes to use at your own pace. Great value for regular students.',
      price: 280.00,
      duration_type: 'unlimited',
      duration_value: null,
      class_credits: 10,
      guest_passes: 1,
      freeze_option: false,
      max_freeze_days: 0,
      enrollment_fee: 0,
      cancellation_fee: 0,
      terms_and_conditions: 'Valid for 6 months from date of purchase. Classes are non-refundable and non-transferable.',
      benefits: [
        '10 classes to use flexibly',
        '1 guest pass included',
        'Valid for 6 months',
        'Better value than drop-ins'
      ],
      restrictions: [
        'Expires 6 months from purchase',
        'Non-refundable',
        'Non-transferable between users'
      ],
      is_active: true,
      sort_order: 3
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      name: 'Student Monthly',
      description: 'Special monthly unlimited membership for students. Valid student ID required.',
      price: 99.00,
      duration_type: 'monthly',
      duration_value: 1,
      class_credits: -1, // unlimited
      guest_passes: 1,
      freeze_option: true,
      max_freeze_days: 7,
      enrollment_fee: 0,
      cancellation_fee: 25.00,
      terms_and_conditions: 'Valid student ID required at signup and periodically verified. Auto-renews monthly.',
      benefits: [
        'Unlimited classes',
        '1 guest pass per month',
        'Student discount pricing',
        'Freeze option available'
      ],
      restrictions: [
        'Valid student ID required',
        'Subject to verification',
        'Maximum 7 freeze days per period'
      ],
      is_active: true,
      sort_order: 4
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      name: 'Annual Membership',
      description: 'Full year of unlimited classes with the best value and exclusive perks.',
      price: 1299.00,
      duration_type: 'yearly',
      duration_value: 1,
      class_credits: -1, // unlimited
      guest_passes: 5,
      freeze_option: true,
      max_freeze_days: 60,
      enrollment_fee: 0,
      cancellation_fee: 100.00,
      terms_and_conditions: 'Paid annually. Prorated refunds available in first 30 days. Freeze option available for extended periods.',
      benefits: [
        'Unlimited classes for 12 months',
        '5 guest passes per month',
        'Best value pricing',
        'Extended freeze options',
        'VIP member events',
        'Priority booking',
        'Merchandise discounts'
      ],
      restrictions: [
        'Annual payment required',
        'Limited refund window',
        'Maximum 60 freeze days per year'
      ],
      is_active: true,
      sort_order: 5
    }
  ];

  await knex('membership_plans').insert(membershipPlans);
}