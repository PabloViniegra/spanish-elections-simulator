import { drawLots } from "./lot";
import type { Candidacy, SeatAward } from "./types";

type Contender = Candidacy & { divisor: number };

// R-06: seats go one by one to the largest quotient votes / divisor, where
// each candidacy's divisor is its seats so far plus one. Quotients compare by
// cross-multiplication (a·j vs b·i): votes stay well below 2^53 / 350.
export function dhondt(candidacies: readonly Candidacy[], seats: number, lotSeed: string) {
  const contenders: Contender[] = candidacies
    .filter((candidacy) => candidacy.votes > 0)
    .map((candidacy) => ({ ...candidacy, divisor: 1 }));
  const awards: SeatAward[] = [];
  const pickByLot = lotPicker(
    contenders.map((contender) => contender.id),
    lotSeed,
  );

  while (contenders.length > 0 && awards.length < seats) {
    const best = contenders.reduce((top, contender) => (compareQuotients(contender, top) > 0 ? contender : top));
    const tied = contenders.filter((contender) => compareQuotients(contender, best) === 0);
    const remaining = seats - awards.length;

    if (tied.length <= remaining) {
      // Every tied quotient gets a seat, so the tie decides nothing.
      [...tied]
        .sort((a, b) => b.votes - a.votes || a.id.localeCompare(b.id))
        .forEach((contender) => awards.push(award(contender, false)));
      continue;
    }

    // R-07: tied quotients compete for fewer seats; more total votes wins,
    // and equal totals go to lot.
    const mostVotes = Math.max(...tied.map((contender) => contender.votes));
    const leaders = tied.filter((contender) => contender.votes === mostVotes);
    const winner = leaders.length === 1 ? leaders[0] : pickByLot(leaders);
    awards.push(award(winner, leaders.length > 1));
  }

  return { awards, vacantSeats: seats - awards.length };
}

function compareQuotients(a: Contender, b: Contender) {
  return a.votes * b.divisor - b.votes * a.divisor;
}

function award(contender: Contender, decidedByLot: boolean): SeatAward {
  const seat = { candidacyId: contender.id, votes: contender.votes, divisor: contender.divisor, decidedByLot };
  contender.divisor += 1;
  return seat;
}

// LOREG art. 163.1.d: the first full tie is decided by lot and later ones
// alternate. The lot draws one order of all candidacies; each tie goes to the
// next tied candidacy in that order after the previous lot winner.
function lotPicker(ids: readonly string[], seed: string) {
  const order = drawLots(ids, seed);
  let turn = 0;
  return (leaders: readonly Contender[]) => {
    for (let step = 0; step < order.length; step++) {
      const index = (turn + step) % order.length;
      const winner = leaders.find((leader) => leader.id === order[index]);
      if (winner) {
        turn = index + 1;
        return winner;
      }
    }
    return leaders[0];
  };
}
