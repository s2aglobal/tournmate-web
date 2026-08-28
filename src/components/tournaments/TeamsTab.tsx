import type { Registration, Tournament } from "../../types";
import { tournamentFormat, isSinglesFormat } from "../../types";

function avatarUrl(seed: string, style: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

function TeamRow({ reg, isSingles }: { reg: Registration; isSingles: boolean }) {
  const p = reg.player;
  if (!p) return null;
  return (
    <div className="team-row">
      <img src={avatarUrl(p.name, p.avatarId ?? "adventurer")} alt="" className="team-avatar" />
      <div className="team-info">
        <span className="team-name">{p.name}</span>
        {!isSingles && reg.partner && (
          <span className="team-partner">& {reg.partner.name}</span>
        )}
      </div>
      <span className="team-elo">
        {isSingles ? p.elo : Math.round(((p.elo ?? 1200) + (reg.partner?.elo ?? 1200)) / 2)} Elo
      </span>
    </div>
  );
}

export default function TeamsTab({ tournament, registrations }: {
  tournament: Tournament;
  registrations: Registration[];
}) {
  const fmt = tournamentFormat(tournament);
  const singles = isSinglesFormat(fmt);

  const formedTeams = registrations.filter(
    (r) => singles || r.partnerId
  );
  const soloRegs = singles ? [] : registrations.filter((r) => !r.partnerId);

  return (
    <div className="teams-tab">
      <h3 className="tab-section-title">Registered Teams ({formedTeams.length})</h3>
      {formedTeams.length === 0 ? (
        <p className="tab-empty">No teams registered yet.</p>
      ) : (
        <div className="team-list">
          {formedTeams.map((r) => (
            <TeamRow key={r.id} reg={r} isSingles={singles} />
          ))}
        </div>
      )}

      {!singles && soloRegs.length > 0 && (
        <>
          <h3 className="tab-section-title" style={{ marginTop: 24 }}>
            Awaiting Partner ({soloRegs.length})
          </h3>
          <div className="team-list">
            {soloRegs.map((r) => (
              <TeamRow key={r.id} reg={r} isSingles={false} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
