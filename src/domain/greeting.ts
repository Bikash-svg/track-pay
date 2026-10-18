// Daytime greeting. Pure TypeScript: no React, no react-native, no expo, no
// storage, no console, no Date.now(). The caller passes the moment in, so the
// tests are timezone-independent and the function is trivially unit-testable.
//
// Morning 05:00-11:59, afternoon 12:00-16:59, evening 17:00-04:59, per
// DESIGN.md 13 and EVALS O3. Boundaries (04:59/05:00, 11:59/12:00,
// 16:59/17:00) are tested in greeting.test.ts.
//
// Empty-string and null both render the nameless form: "Good morning".
// A present name renders as "Good morning, {firstName}".

export function greeting(now: Date, firstName: string | null): string {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const isMorning = minutes >= 5 * 60 && minutes < 12 * 60;
  const isAfternoon = minutes >= 12 * 60 && minutes < 17 * 60;
  const timeOfDay = isMorning
    ? 'Good morning'
    : isAfternoon
      ? 'Good afternoon'
      : 'Good evening';
  const hasName = typeof firstName === 'string' && firstName.length > 0;
  return hasName ? `${timeOfDay}, ${firstName}` : timeOfDay;
}