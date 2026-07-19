import type { FamilyFixtureGoalEvent } from "@/lib/world-cup-verified-snapshot";
import { formatFamilyFixtureGoalEvent } from "@/lib/world-cup-verified-snapshot";

type LiveGoalEventsProps = {
  events: FamilyFixtureGoalEvent[];
  className?: string;
  itemClassName?: string;
};

export function LiveGoalEvents({
  events,
  className = "",
  itemClassName = "",
}: LiveGoalEventsProps) {
  if (events.length === 0) return null;

  return (
    <ul className={className}>
      {events.map((event) => (
        <li key={`${event.minute}-${event.scorer}`} className={itemClassName}>
          {formatFamilyFixtureGoalEvent(event)}
        </li>
      ))}
    </ul>
  );
}
