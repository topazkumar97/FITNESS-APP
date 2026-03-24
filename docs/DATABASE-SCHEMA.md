# Fitness App Database Schema

## 1. Design goals
- Support user authentication and profile management.
- Support workout planning and session tracking.
- Support progress logging and reminders.
- Be relational enough for analytics and subscriptions.
- Keep v1 small but extensible.

## 2. Tables overview
- users
- profiles
- goals
- exercises
- workouts
- workout_plans
- workout_plan_items
- workout_sessions
- workout_session_items
- progress_logs
- notifications
- admin_users
- subscriptions

## 3. Table definitions

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| email | varchar | Unique |
| phone | varchar | Nullable |
| password_hash | varchar | Nullable if using external auth |
| role | varchar | user/admin |
| status | varchar | active/inactive/blocked |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK to users.id |
| full_name | varchar |  |
| gender | varchar | Nullable |
| age | int | Nullable |
| height_cm | numeric | Nullable |
| weight_kg | numeric | Nullable |
| fitness_goal | varchar | fat loss/muscle gain/maintenance |
| activity_level | varchar | low/moderate/high |
| avatar_url | text | Nullable |
| timezone | varchar | Nullable |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### goals
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK to users.id |
| target_weight_kg | numeric | Nullable |
| target_calories | int | Nullable |
| target_steps | int | Nullable |
| target_date | date | Nullable |
| weekly_workout_days | int | Nullable |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### exercises
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | varchar | Unique with variation |
| muscle_group | varchar | chest/back/legs etc. |
| equipment | varchar | bodyweight/dumbbell/etc. |
| difficulty | varchar | beginner/intermediate/advanced |
| instructions | text |  |
| video_url | text | Nullable |
| image_url | text | Nullable |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### workouts
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| title | varchar |  |
| description | text | Nullable |
| type | varchar | strength/cardio/mobility/etc. |
| level | varchar | beginner/intermediate/advanced |
| duration_minutes | int | Nullable |
| calories_burned_estimate | int | Nullable |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### workout_plans
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK to users.id |
| title | varchar |  |
| status | varchar | draft/active/completed/archived |
| start_date | date | Nullable |
| end_date | date | Nullable |
| is_premium | boolean | Default false |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### workout_plan_items
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workout_plan_id | uuid | FK to workout_plans.id |
| workout_id | uuid | FK to workouts.id |
| day_of_week | varchar | Monday-Sunday |
| order_index | int | order in the day |
| notes | text | Nullable |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### workout_sessions
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK to users.id |
| workout_id | uuid | FK to workouts.id |
| plan_item_id | uuid | Nullable FK to workout_plan_items.id |
| started_at | timestamp | Nullable |
| completed_at | timestamp | Nullable |
| status | varchar | planned/in_progress/completed/skipped |
| duration_seconds | int | Nullable |
| calories_burned | int | Nullable |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### workout_session_items
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workout_session_id | uuid | FK to workout_sessions.id |
| exercise_id | uuid | FK to exercises.id |
| sets | int | Nullable |
| reps | int | Nullable |
| weight | numeric | Nullable |
| duration_seconds | int | Nullable |
| rest_seconds | int | Nullable |
| notes | text | Nullable |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### progress_logs
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK to users.id |
| type | varchar | weight/steps/workout/etc. |
| value | numeric |  |
| unit | varchar | kg/steps/mins/etc. |
| logged_at | timestamp | Default now |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### notifications
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK to users.id |
| type | varchar | reminder/streak/promo/etc. |
| payload | jsonb | notification data |
| status | varchar | pending/sent/read/failed |
| scheduled_for | timestamp | Nullable |
| sent_at | timestamp | Nullable |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

### admin_users
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK to users.id |
| permissions | jsonb | admin permissions |
| created_at | timestamp | Default now |

### subscriptions
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK to users.id |
| plan_name | varchar | free/premium/pro |
| status | varchar | active/cancelled/past_due |
| start_date | date | Nullable |
| end_date | date | Nullable |
| payment_provider_ref | varchar | Nullable |
| created_at | timestamp | Default now |
| updated_at | timestamp | Default now |

## 4. Indexes
- users.email unique index
- profiles.user_id unique index
- goals.user_id index
- workout_plans.user_id index
- workout_plan_items.workout_plan_id index
- workout_sessions.user_id index
- workout_session_items.workout_session_id index
- progress_logs.user_id index
- notifications.user_id index

## 5. Constraints
- One profile per user.
- One active subscription per user.
- Plans must belong to one user.
- Plan items must belong to one plan.
- Session items must belong to one session.
- Notification status must be one of pending/sent/read/failed.

## 6. Recommended enums
### role
- user
- admin

### plan status
- draft
- active
- completed
- archived

### session status
- planned
- in_progress
- completed
- skipped

### notification status
- pending
- sent
- read
- failed

## 7. v1 schema philosophy
Keep the schema strict enough to prevent bad data, but not so rigid that it blocks experimentation. Add meals, coach features, social features, and analytics tables only after the core product loop is stable.