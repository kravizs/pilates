import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex.raw('TRUNCATE TABLE cms_content CASCADE');
  
  // Insert sample CMS content
  const cmsContent = [
    {
      id: knex.raw('uuid_generate_v4()'),
      content_type: 'page',
      title: 'About Hi Studio',
      slug: 'about',
      content: `# Welcome to Hi Studio

Hi Studio is more than just a wellness center – we're a community dedicated to helping you discover your inner strength and find balance in your daily life.

## Our Story

Founded in 2020, Hi Studio emerged from a simple belief: everyone deserves access to high-quality wellness experiences that nurture both body and mind. Our founders, passionate practitioners themselves, created a space where ancient wisdom meets modern lifestyle.

## Our Mission

To provide a welcoming, inclusive environment where individuals of all backgrounds and fitness levels can explore movement, mindfulness, and personal growth through expertly guided classes and supportive community connections.

## What Makes Us Different

- **Expert Instructors**: Our team consists of certified professionals with years of experience
- **Diverse Offerings**: From gentle yoga to high-intensity training, we have something for everyone
- **Community Focus**: We believe in the power of community to support personal transformation
- **Holistic Approach**: We address not just physical fitness, but mental and emotional wellbeing`,
      excerpt: 'Discover Hi Studio - your community wellness center dedicated to nurturing body, mind, and spirit through expert-led classes and supportive community.',
      metadata: {
        seo_title: 'About Hi Studio - Your Community Wellness Center',
        seo_description: 'Learn about Hi Studio\'s mission to provide inclusive, high-quality wellness experiences for all backgrounds and fitness levels.',
        featured_image: '/images/about-hero.jpg'
      },
      translations: {
        fr: {
          title: 'À propos de Hi Studio',
          excerpt: 'Découvrez Hi Studio - votre centre de bien-être communautaire dédié à nourrir le corps, l\'esprit et l\'âme.'
        },
        es: {
          title: 'Acerca de Hi Studio',
          excerpt: 'Descubre Hi Studio - tu centro de bienestar comunitario dedicado a nutrir cuerpo, mente y espíritu.'
        }
      },
      status: 'published',
      published_at: knex.fn.now(),
      view_count: 0,
      sort_order: 1,
      is_featured: false
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      content_type: 'page',
      title: 'Class Policies',
      slug: 'class-policies',
      content: `# Class Policies

Please read our policies carefully to ensure a positive experience for all members.

## Booking and Cancellation

### Advance Booking
- Classes can be booked up to 7 days in advance
- Members have priority booking privileges
- Wait list available when classes are full

### Cancellation Policy
- Cancel at least 4 hours before class start time
- Late cancellations may result in class credit forfeit
- No-shows will be charged full class fee

## Studio Guidelines

### Arrival Time
- Arrive at least 10 minutes before class begins
- Late arrivals may not be admitted if class has started

### What to Bring
- Yoga mat (rentals available for $3)
- Water bottle
- Towel for heated classes
- Comfortable, appropriate workout attire

### Studio Etiquette
- Silence mobile devices
- Respect other students' practice
- Follow instructor guidance
- Clean equipment after use

## Health and Safety

### Health Conditions
- Inform instructor of injuries or health conditions
- Practice at your own pace and within your limits
- Pregnant students must get medical clearance

### COVID-19 Protocols
- Stay home if feeling unwell
- Follow current capacity restrictions
- Maintain appropriate social distancing when possible`,
      excerpt: 'Important policies and guidelines for Hi Studio classes including booking, cancellation, and studio etiquette.',
      metadata: {
        seo_title: 'Class Policies - Hi Studio Guidelines',
        seo_description: 'Review Hi Studio\'s class policies including booking, cancellation, and studio guidelines for a positive experience.'
      },
      status: 'published',
      published_at: knex.fn.now(),
      view_count: 0,
      sort_order: 2,
      is_featured: false
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      content_type: 'blog_post',
      title: '5 Benefits of Regular Yoga Practice',
      slug: '5-benefits-regular-yoga-practice',
      content: `# 5 Benefits of Regular Yoga Practice

Yoga is much more than physical exercise – it's a holistic practice that benefits your entire being. Here are five compelling reasons to make yoga a regular part of your routine.

## 1. Improved Flexibility and Strength

Regular yoga practice gradually increases flexibility while building functional strength. Unlike traditional weight training, yoga develops strength through your full range of motion, creating balanced muscle development.

## 2. Stress Reduction and Mental Clarity

The combination of breathwork, meditation, and mindful movement helps activate your parasympathetic nervous system, reducing stress hormones and promoting mental clarity.

## 3. Better Sleep Quality

Studies show that regular yoga practitioners experience improved sleep quality and fall asleep faster. The relaxation techniques learned in yoga help calm the mind before bedtime.

## 4. Enhanced Body Awareness

Yoga develops proprioception – your sense of body position and movement. This increased awareness helps prevent injuries and improves coordination in daily activities.

## 5. Community and Connection

Practicing yoga in a group setting creates opportunities for meaningful connections and support from like-minded individuals on similar wellness journeys.

Ready to experience these benefits yourself? Join us for a class at Hi Studio!`,
      excerpt: 'Discover how regular yoga practice can transform your physical health, mental wellbeing, and social connections.',
      metadata: {
        seo_title: '5 Amazing Benefits of Regular Yoga Practice | Hi Studio',
        seo_description: 'Learn about the physical and mental benefits of regular yoga practice and how it can improve your overall wellbeing.',
        featured_image: '/images/yoga-benefits.jpg',
        tags: ['yoga', 'wellness', 'health', 'benefits']
      },
      status: 'published',
      published_at: knex.fn.now(),
      view_count: 0,
      sort_order: 0,
      is_featured: true
    },
    {
      id: knex.raw('uuid_generate_v4()'),
      content_type: 'faq',
      title: 'Frequently Asked Questions',
      slug: 'faq',
      content: `# Frequently Asked Questions

## General Questions

**Q: Do I need to bring my own yoga mat?**
A: While we recommend bringing your own mat for hygiene reasons, we offer mat rentals for $3 per class.

**Q: What should I wear to class?**
A: Comfortable, stretchy clothing that allows for easy movement. Avoid loose clothing that might get in the way during poses.

**Q: I'm a complete beginner. Which classes should I start with?**
A: We recommend starting with our Hatha Yoga or beginner-friendly classes. Our instructors provide modifications for all levels.

## Membership Questions

**Q: Can I freeze my membership?**
A: Yes, most memberships include freeze options. Check your specific membership terms for details.

**Q: How do I cancel my membership?**
A: Contact us at least 30 days before your next billing cycle. Cancellation terms vary by membership type.

**Q: Do you offer student discounts?**
A: Yes! We offer special student pricing with valid student ID verification.

## Booking Questions

**Q: How far in advance can I book classes?**
A: Members can book up to 7 days in advance. Drop-in students can book up to 3 days ahead.

**Q: What happens if a class is full?**
A: You can join the waitlist and we'll notify you if a spot opens up.

**Q: Can I bring a friend?**
A: Absolutely! Many memberships include guest passes, or your friend can purchase a drop-in class.`,
      excerpt: 'Get answers to common questions about classes, memberships, booking, and studio policies.',
      metadata: {
        seo_title: 'FAQ - Hi Studio Frequently Asked Questions',
        seo_description: 'Find answers to common questions about Hi Studio classes, memberships, and policies.'
      },
      status: 'published',
      published_at: knex.fn.now(),
      view_count: 0,
      sort_order: 3,
      is_featured: false
    }
  ];

  await knex('cms_content').insert(cmsContent);
}