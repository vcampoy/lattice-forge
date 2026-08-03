# Business model

Lattice Forge is a product concept for explaining Design for Additive Manufacturing tradeoffs through an interactive bracket-design workflow. The implemented prototype now combines a deterministic analysis API, a procedural Three.js bracket viewport, and live parametric design controls; manufacturing optimization and analysis integration remain planned.

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

Lattice Forge combines a future interactive 3D workspace with a deterministic analysis contract. Its intended value is rapid, explainable exploration—not automatic engineering approval.

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

**Implemented today:** API health, material discovery, analysis calculation, the responsive workspace shell, an interactive parametric bracket viewport with orbit/reset controls, live dimension controls, presets, process/material compatibility filtering, conceptual lattice reveal, and Solid/Optimized/Compare views. Live analysis integration, persistence, and export are not integrated.

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
| Unsafe geometry exported or manufactured | Engineering validation and production export are outside current implemented scope; phase 05 lattice is conceptual only |
| Third-party affiliation inferred | The project uses its own identity and makes no affiliation or endorsement claim |

## Disclaimer

Lattice Forge is an independent demonstration project. It is not affiliated with, endorsed by, or based on proprietary assets from Materialise. Its outputs are illustrative estimates, not engineering, safety, compliance, pricing, or manufacturing advice.

## Scope boundary

The product concept supports early exploration and communication. It does not replace CAD, topology optimization, finite-element analysis, build preparation, slicing, machine qualification, regulatory review, or an additive-manufacturing engineer.

No pricing model, commercial packaging, production tenancy, or revenue forecast is defined. Those decisions would be premature without validated users, workflows, and model fidelity.

## Phase 06 — Live analysis experience

The right panel now consumes the real ASP.NET Core analysis contract as users adjust geometry, material, or process. Debouncing protects the API during slider movement; cancellation ensures the visible result always belongs to the current design. Success, validation, unavailable, and retry states make the workflow trustworthy instead of hiding failures.

This strengthens the product hypothesis that a single visual workspace can connect a design choice to understandable manufacturing tradeoffs. The API values remain explicitly illustrative and are not positioned as quotes, certification, or Materialise functionality. The compact Solid-versus-Optimized comparison and suggested corrections improve the conversation with a designer, while persistence, export, and production validation remain outside the current scope.
