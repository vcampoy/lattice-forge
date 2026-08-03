# Business model

Lattice Forge is a product concept for explaining Design for Additive Manufacturing tradeoffs through an interactive bracket-design workflow. The implemented prototype combines a deterministic analysis API, a procedural Three.js bracket viewport, live parametric design controls, local design persistence, and conceptual export; manufacturing validation remains planned.

## Problem

Additive-manufacturing decisions connect geometry, material, process, weight, cost, time, and manufacturability. Those relationships are difficult to communicate when design and analysis tools expose them as separate expert workflows or static reports.

The concept addresses an early-stage question: **how might a design choice affect manufacturing outcomes before a specialist performs engineering validation?**

## Target users

| User | Need |
|---|---|
| Product or mechanical designer | Explore lightweighting choices before a formal engineering handoff |
| Additive-manufacturing engineer | Explain constraints and tradeoffs to non-specialist stakeholders |
| Sales or solutions engineer | Demonstrate a coherent digital manufacturing workflow |
| Technical reviewer | Evaluate the architecture and product reasoning behind a full-stack 3D prototype |

The current interview demo primarily serves technical reviewers and hiring stakeholders. The broader personas are hypotheses, not validated customer segments.

## Jobs to be done

- When exploring a bracket concept, help me understand how dimensions, lattice density, material, and process could influence weight, cost, time, and printability.
- When discussing additive manufacturing with a stakeholder, give me a visual and numerical narrative that is easier to understand than disconnected forms and reports.
- When handing a concept to an expert, make assumptions and limitations explicit so illustrative feedback is not mistaken for certification.

## Value proposition

Lattice Forge combines a future interactive 3D workspace with a deterministic analysis contract. Its intended value is rapid, explainable explorationâ€”not automatic engineering approval.

Today, the implemented value is narrower:

- a stable material and process vocabulary;
- consistent illustrative estimates for the same input;
- early warnings for minimum wall thickness; and
- an API boundary that can support a future visual workflow.

### Phase 02-04 experience signal

The workspace now makes the intended product narrative visible in one screen: geometry controls on the left, an interactive mechanical bracket viewport in the centre, and manufacturing outcomes on the right. A WebGL fallback preserves the surrounding workflow on unsupported browsers. Empty metrics intentionally remain pending, while live dimension changes make the design-to-manufacturing conversation tangible without presenting fabricated results. This improves early design comprehension but does not change pricing assumptions.

## Primary workflow

The intended workflow is:

1. Inspect a parametric mechanical bracket.
2. Adjust dimensions, wall thickness, hole radius, lattice density, process, and material.
3. Request analysis from the .NET API.
4. Compare solid and optimized outcomes.
5. Review warnings and the illustrative-estimate disclaimer.
6. Save or export the concept for further work.

**Implemented today:** API health, material discovery, analysis calculation, the responsive workspace shell, an interactive parametric bracket viewport with orbit/reset controls, live dimension controls, presets, process/material compatibility filtering, conceptual lattice reveal, Solid/Optimized/Compare views, live analysis integration, local design persistence, and demo STL/JSON export. Exports and metrics remain illustrative; the lattice is not validated for watertightness or printability.

## Business assumptions

- Immediate, explainable feedback improves early design conversations.
- A mechanical bracket is specific enough to feel credible and constrained enough for a short demo.
- Users benefit from comparing directional changes even when the numbers are explicitly illustrative.
- Material and process compatibility should constrain the workflow before analysis.
- Trust increases when model assumptions and units are visible rather than hidden behind a score.

The phase 04 interaction adds a testable assumption that immediate, bounded geometry feedback improves early design conversations; this still requires user and domain-expert validation before commercial use.

Phase 05 adds a testable assumption that direct Solid-versus-Optimized visual comparison helps stakeholders discuss lightweighting tradeoffs faster than controls or metrics alone. The lattice is explicitly conceptual and must not be treated as printable engineering output.

## Illustrative metrics

The prototype calculates:

- solid and optimized volume;
- estimated weight;
- estimated material cost;
- estimated print time;
- material reduction;
- printability score;
- support-risk category; and
- wall-thickness warnings.

These metrics are deterministic heuristics. They exclude machine setup, support material, nesting, build orientation, post-processing, labour, yield, energy, quality requirements, tax, and commercial margin. They must not be used for quoting or production decisions.

## Differentiation hypothesis

The concept aims to differentiate through one coherent story: edit a recognizable component, reveal a lightweight structure, and explain manufacturing impact in the same workspace. The combination of interaction, transparent assumptions, and a real backend contract is more defensible than a purely visual Three.js scene or a disconnected cost calculator.

This is a prototype hypothesis. No market comparison or customer validation has been completed.

## Risks and responsible use

| Risk | Current response |
|---|---|
| Illustrative values mistaken for engineering results | Every analysis returns `illustrativeEstimate: true`; product copy and documentation repeat the limitation |
| Material profiles treated as supplier specifications | Catalogue entries are described as deterministic demo data |
| Printability score creates false confidence | Score is documented as a bounded heuristic and accompanied by warnings |
| Unsafe geometry exported or manufactured | Export is clearly labelled as a conceptual demo mesh; watertightness, printability, and engineering validation remain outside scope |
| Third-party affiliation inferred | The project uses its own identity and makes no affiliation or endorsement claim |

## Disclaimer

Lattice Forge is an independent demonstration project. It is not affiliated with, endorsed by, or based on proprietary assets from Materialise. Its outputs are illustrative estimates, not engineering, safety, compliance, pricing, or manufacturing advice.

## Scope boundary

The product concept supports early exploration and communication. It does not replace CAD, topology optimization, finite-element analysis, build preparation, slicing, machine qualification, regulatory review, or an additive-manufacturing engineer.

No pricing model, commercial packaging, production tenancy, or revenue forecast is defined. Those decisions would be premature without validated users, workflows, and model fidelity.

## Phase 06 â€” Live analysis experience

The right panel now consumes the real ASP.NET Core analysis contract as users adjust geometry, material, or process. Debouncing protects the API during slider movement; cancellation ensures the visible result always belongs to the current design. Success, validation, unavailable, and retry states make the workflow trustworthy instead of hiding failures.

This strengthens the product hypothesis that a single visual workspace can connect a design choice to understandable manufacturing tradeoffs. The API values remain explicitly illustrative and are not positioned as quotes, certification, or Materialise functionality. The compact Solid-versus-Optimized comparison and suggested corrections improve the conversation with a designer, while persistence, export, and production validation remain outside the current scope.

## Phase 07 ? Optimization scan experience

The Optimize for Manufacturing action turns the analysis into a short, repeatable story: scan the part, reveal the conceptual lattice, expose deterministic overhang risk, and finish in a before/after comparison. A legend and non-colour warning representation keep the heatmap understandable and accessible.

This strengthens the interview-demo hypothesis that a guided transition can communicate lightweighting tradeoffs faster than a static dashboard. It does not add a commercial optimization claim: the heatmap is deterministic and illustrative, API failures never fabricate metrics, and engineering validation remains outside scope.

## Tooling impact

The npm-to-pnpm frontend tooling migration has no product, pricing, or manufacturing-model impact. It changes dependency installation and reproducibility only; product scope and illustrative equations remain unchanged.

## Phase 08 — Persistence and export experience

Named local design snapshots and recent-design loading make the demo journey recoverable without introducing accounts or a production data model. STL and JSON export make the concept portable for discussion, but the product deliberately discloses that the lattice is a demo mesh and has not been checked for watertightness or printability. This improves interview-demo usefulness without turning illustrative analysis into a manufacturing promise.

## Phase 09 — Hardening and responsible interaction

Phase 09 adds no new product capability. It reduces demo risk by making the existing workflow usable on narrow screens, keyboard reachable outside raw 3D orbit, resilient to API/material/WebGL failure, and honest about unsupported browser and engineering conditions. Rendering caps and reduced-motion handling protect responsiveness without changing the illustrative manufacturing model or making a zero-vulnerability claim.
## Phase 10 — Interview delivery boundary

Phase 10 adds no product capability or commercial claim. It makes the existing value proposition easier to communicate: one deterministic DfAM interaction connects parametric design, a conceptual lattice, and illustrative manufacturing estimates while clearly separating demo behaviour from engineering validation.

The new README and interview script improve reviewer understanding and presenter consistency. The one-command launcher reduces setup friction for an interview without changing the supported local workflow or introducing a production deployment promise. Genuine next steps remain validated manufacturing models, watertight export validation, production persistence, browser/device coverage, and operational observability.

## Phase 11 — Adversarial release review

The review repaired procedural geometry safety, frontend request lifecycle behavior, and Windows-safe export naming. No product proposition, pricing assumption, manufacturing claim, or user workflow changed. The demo remains an illustrative design-exploration workspace and does not claim engineering validation or production-ready lattice export.
