// Import the rendercv function and all the refactored components
#import "@preview/rendercv:0.3.0": *

// Apply the rendercv template with custom configuration
#show: rendercv.with(
  name: "Seonghyun Park",
  title: "Seonghyun Park - CV",
  footer: context { [#emph[Seonghyun Park -- #str(here().page())\/#str(counter(page).final().first())]] },
  top-note: [ #emph[Last updated in May 2026] ],
  locale-catalog-language: "en",
  text-direction: ltr,
  page-size: "us-letter",
  page-top-margin: 0.7in,
  page-bottom-margin: 0.7in,
  page-left-margin: 0.7in,
  page-right-margin: 0.7in,
  page-show-footer: true,
  page-show-top-note: true,
  colors-body: rgb(0, 0, 0),
  colors-name: rgb(0, 79, 144),
  colors-headline: rgb(0, 79, 144),
  colors-connections: rgb(0, 79, 144),
  colors-section-titles: rgb(0, 79, 144),
  colors-links: rgb(0, 79, 144),
  colors-footer: rgb(128, 128, 128),
  colors-top-note: rgb(128, 128, 128),
  typography-line-spacing: 0.6em,
  typography-alignment: "justified",
  typography-date-and-location-column-alignment: right,
  typography-font-family-body: "Source Sans 3",
  typography-font-family-name: "Source Sans 3",
  typography-font-family-headline: "Source Sans 3",
  typography-font-family-connections: "Source Sans 3",
  typography-font-family-section-titles: "Source Sans 3",
  typography-font-size-body: 10pt,
  typography-font-size-name: 30pt,
  typography-font-size-headline: 10pt,
  typography-font-size-connections: 10pt,
  typography-font-size-section-titles: 1.4em,
  typography-small-caps-name: false,
  typography-small-caps-headline: false,
  typography-small-caps-connections: false,
  typography-small-caps-section-titles: false,
  typography-bold-name: true,
  typography-bold-headline: false,
  typography-bold-connections: false,
  typography-bold-section-titles: true,
  links-underline: false,
  links-show-external-link-icon: false,
  header-alignment: center,
  header-photo-width: 3.5cm,
  header-space-below-name: 0.7cm,
  header-space-below-headline: 0.7cm,
  header-space-below-connections: 0.7cm,
  header-connections-hyperlink: true,
  header-connections-show-icons: true,
  header-connections-display-urls-instead-of-usernames: false,
  header-connections-separator: "",
  header-connections-space-between-connections: 0.5cm,
  section-titles-type: "with_partial_line",
  section-titles-line-thickness: 0.5pt,
  section-titles-space-above: 0.5cm,
  section-titles-space-below: 0.3cm,
  sections-allow-page-break: true,
  sections-space-between-text-based-entries: 0.3em,
  sections-space-between-regular-entries: 1.2em,
  entries-date-and-location-width: 4.15cm,
  entries-side-space: 0.2cm,
  entries-space-between-columns: 0.1cm,
  entries-allow-page-break: false,
  entries-short-second-row: true,
  entries-degree-width: 1cm,
  entries-summary-space-left: 0cm,
  entries-summary-space-above: 0cm,
  entries-highlights-bullet:  "•" ,
  entries-highlights-nested-bullet:  "•" ,
  entries-highlights-space-left: 0.15cm,
  entries-highlights-space-above: 0cm,
  entries-highlights-space-between-items: 0cm,
  entries-highlights-space-between-bullet-and-text: 0.5em,
  date: datetime(
    year: 2026,
    month: 5,
    day: 8,
  ),
)


= Seonghyun Park

#connections(
  [#connection-with-icon("location-dot")[Seoul, South Korea]],
  [#link("mailto:hyun26@kaist.ac.kr", icon: false, if-underline: false, if-color: false)[#connection-with-icon("envelope")[hyun26\@kaist.ac.kr]]],
  [#link("tel:+82-10-6869-1033", icon: false, if-underline: false, if-color: false)[#connection-with-icon("phone")[010-6869-1033]]],
  [#link("https://seonghyun26.github.io/hyun/", icon: false, if-underline: false, if-color: false)[#connection-with-icon("link")[seonghyun26.github.io\/hyun]]],
  [#link("https://linkedin.com/in/shpark26", icon: false, if-underline: false, if-color: false)[#connection-with-icon("linkedin")[shpark26]]],
  [#link("https://github.com/seonghyun26", icon: false, if-underline: false, if-color: false)[#connection-with-icon("github")[seonghyun26]]],
  [#link("https://scholar.google.com/citations?user=w4q4N9sAAAAJ", icon: false, if-underline: false, if-color: false)[#connection-with-icon("graduation-cap")[Google Scholar]]],
)


== Summary

I'm a second-year Ph.D. student at #link("https://gsai.kaist.ac.kr/")[Graduate School of AI at KAIST], advised by #link("https://sungsoo-ahn.github.io/")[Sungsoo Ahn]. Currently, my research focuses on #strong[AI for Science (AI4Science)], specifically integrating machine learning with biomolecular modeling and molecular dynamics (MD). Recently, I led a project on machine learning–based Collective Variables (CVs) for enhanced sampling of proteins, by repurposing foundation models.

== Education

#education-entry(
  [
    #strong[Korea Advanced Institute of Science and Technology (KAIST)], Kim Jaechul Graduate School of Artificial Intelligence

    - #link("https://sites.google.com/view/sungsooahn0215")[Structured and Probabilistic Machine Learning Lab] \@ Sungsoo Ahn

    - Interest: Bio-molecules, Molecular dynamics (MD)

  ],
  [
    Seoul, South Korea

    Feb 2025 – present

  ],
  degree-column: [
    #strong[Ph.D.]
  ],
)

#education-entry(
  [
    #strong[Pohang University of Science and Technology (POSTECH)], Graduate School of Computer Science and Engineering (CSE)

    - #link("https://ml.postech.ac.kr/")[Machine Learning Lab] \@ Sungsoo Ahn

    - Interest: Graph Neural Networks (GNNs), Over-squashing

  ],
  [
    Pohang, South Korea

    Mar 2023 – Feb 2025

  ],
  degree-column: [
    #strong[M.S.]
  ],
)

#education-entry(
  [
    #strong[Institut National des Sciences Appliquées (INSA) Lyon], Bioinformatics

    #summary[Exchange Student]

  ],
  [
    Lyon, France

    Jan 2022 – June 2022

  ],
  degree-column: [
    #strong[E.S.]
  ],
)

#education-entry(
  [
    #strong[Pohang University of Science and Technology (POSTECH)], Computer Science and Engineering (CSE)

  ],
  [
    Pohang, South Korea

    Feb 2019 – Feb 2023

  ],
  degree-column: [
    #strong[B.S.]
  ],
)

== Experience

#regular-entry(
  [
    #strong[Bagelcode], Business Analyst (BA) intern

    #summary[Game economy management and KPI analysis automation]

  ],
  [
    Seoul, South Korea

    June 2021 – Aug 2021

    

    3 months

  ],
)

#regular-entry(
  [
    #strong[Seller Hub], Product Manager (PM) intern

    #summary[Organization-wide task prioritization and landing funnel renewal]

  ],
  [
    Seoul, South Korea

    July 2020 – Aug 2020

    

    2 months

  ],
)

== Publication

#regular-entry(
  [
    #strong[INDIBATOR: Diverse and Fact-Grounded Individuality for Multi-Agent Debate in Molecular Discovery]

    Yunhui Jang, #strong[#emph[Seonghyun Park]], Jaehyung Kim, Sungsoo Ahn

    #link("https://doi.org/10.48550/arXiv.2602.01815")[10.48550\/arXiv.2602.01815] (Preprint)

  ],
  [
    2026

  ],
)

#regular-entry(
  [
    #strong[Boltz is a Strong Baseline for Atom-level Representation Learning]

    Hyosoon Jang, Hyunjin Seo, Honghui Kim, Taewon Kim, Yunhui Jang, #strong[#emph[Seonghyun Park]], Sungsoo Ahn

    #link("https://doi.org/10.48550/arXiv.2602.13249")[10.48550\/arXiv.2602.13249] (Preprint)

  ],
  [
    2026

  ],
)

#regular-entry(
  [
    #strong[Riemannian MeanFlow]

    Dongyeop Woo, Marta Skreta, #strong[#emph[Seonghyun Park]], Kirill Neklyudov, Sungsoo Ahn

    #link("https://doi.org/10.48550/arXiv.2602.07744")[10.48550\/arXiv.2602.07744] (ICML 2026)

  ],
  [
    2026

  ],
)

#regular-entry(
  [
    #strong[Learning Collective Variables from BioEmu with Time-lagged Generation]

    #strong[#emph[Seonghyun Park]], Kiyoung Seong, Soojung Yang, Rafael Gomez-Bombarelli, Sungsoo Ahn

    #link("https://doi.org/10.48550/arXiv.2507.07390")[10.48550\/arXiv.2507.07390] (ICLR 2026)

  ],
  [
    Apr 2026

  ],
)

#regular-entry(
  [
    #strong[Transition Path Sampling with Improved Off-Policy Training of Diffusion Path Samplers]

    Kiyoung Seong, #strong[#emph[Seonghyun Park]], Seonghwan Kim, Woo Youn Kim, Sungsoo Ahn

    #link("https://doi.org/10.48550/arXiv.2405.19961")[10.48550\/arXiv.2405.19961] (ICLR 2025)

  ],
  [
    Apr 2025

  ],
)

#regular-entry(
  [
    #strong[Non-backtracking Graph Neural Networks]

    #strong[#emph[Seonghyun Park]]#emph[, Narae Ryu], Gahee Kim, Dongyeop Woo, Se-Young Yun#strong[, Sungsoo Ahn]

    #link("https://doi.org/10.48550/arXiv.2310.07430")[10.48550\/arXiv.2310.07430] (TMLR 2024, NeurIPS 2023 Workshop GLFrontiers Oral)

  ],
  [
    Sep 2024

  ],
)

#regular-entry(
  [
    #strong[Diffusion Probabilistic Models for Structured Node Classification]

    Hyosoon Jang, #strong[#emph[Seonghyun Park]], Sangwoo Mo, Sungsoo Ahn

    #link("https://doi.org/10.48550/arXiv.2302.10506")[10.48550\/arXiv.2302.10506] (NeurIPS 2023)

  ],
  [
    Nov 2023

  ],
)
