# Fitness App MVP Spec

## 1. Product vision
Build a mobile-first fitness app that helps users track workouts, follow workout plans, log progress, and stay consistent through reminders. The first release should prove that the app can support real users, real data, and a clean backend architecture.

## 2. Target user
- People who want a structured workout and progress tracking app.
- Users who want a simple way to plan workouts and log sessions.
- Future fitness enthusiasts who may upgrade to premium features.

## 3. MVP goals
- Help a user sign up and complete profile setup.
- Let the user create and follow workout plans.
- Let the user log workout sessions.
- Let the user track body progress.
- Send simple reminders and notifications.
- Prepare the product for future subscription and coaching features.

## 4. MVP feature list
### Must have
- Sign up and log in.
- Profile setup.
- Goal setup.
- Exercise library.
- Workout library.
- Workout plan creation.
- Workout plan item management.
- Workout session logging.
- Progress logging.
- Notification/reminder system.
- Basic admin content management.

### Nice to have later
- Meal logging.
- Social feed.
- Live workouts.
- AI recommendations.
- Marketplace.
- Coach dashboard.
- iOS app.
- Web dashboard for users.

## 5. Non-goals for v1
- No social network.
- No live streaming.
- No advanced recommendations engine.
- No marketplace.
- No wearable integrations.
- No complex subscription billing system.
- No AI coach.

## 6. Core user flow
1. User signs up.
2. User logs in.
3. User enters profile and goals.
4. User browses exercises and workouts.
5. User creates a workout plan.
6. User starts a workout session.
7. User logs exercises and sets.
8. User completes the session.
9. User logs body progress.
10. User receives reminders.
11. User sees history and consistency streaks.

## 7. Success criteria
- User can complete onboarding in under 3 minutes.
- User can create a workout plan without admin help.
- User can log a workout session end to end.
- User can view progress history.
- App is deployable and stable in production.
- Backend APIs are documented and tested.

## 8. Technical principles
- Mobile-first.
- Backend-first development.
- TypeScript everywhere.
- Hono for API layer.
- AWS Lambda for serverless execution.
- PostgreSQL for core data.
- S3 for file storage.
- Modular and testable code.
- Start simple, then scale.

## 9. Development strategy
- Build one vertical slice at a time.
- Deploy early.
- Keep every feature production-like.
- Avoid overengineering the first version.
- Focus on the product loop and backend quality.