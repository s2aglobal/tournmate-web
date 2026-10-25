import { sportIcon, sportName, type SportCategory } from "../../services/siteConfig";

/**
 * The apps' "Your sport" grid: every catalog sport by category; live sports
 * can be picked, the rest are dimmed with a "Soon" tag.
 */
export default function SportPicker({
  categories,
  live,
  value,
  onChange,
}: {
  categories: SportCategory[];
  live: string[];
  value: string;
  onChange: (sport: string) => void;
}) {
  return (
    <div className="sport-picker">
      {categories.map((cat) => (
        <div key={cat.id} className="sport-picker-section">
          <div className="sport-picker-title">{cat.title}</div>
          <div className="sport-picker-grid" role="radiogroup" aria-label={cat.title}>
            {cat.sports.map((id) => {
              const isLive = live.includes(id);
              const selected = value === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!isLive}
                  className={`sport-tile${selected ? " selected" : ""}${isLive ? "" : " soon"}`}
                  onClick={() => onChange(id)}
                >
                  <img src={sportIcon(id, 96)} alt="" />
                  {!isLive && <span className="sport-tile-soon">Soon</span>}
                  {selected && <span className="sport-tile-check" aria-hidden="true">✓</span>}
                  <span className="sport-tile-name">{sportName(id)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
