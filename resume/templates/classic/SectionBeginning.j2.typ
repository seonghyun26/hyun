== {{section_title}}
{% if entry_type == "PublicationEntry" %}

#block(below: 0.6cm, sticky: true)[
  #text(size: 8pt, fill: rgb("#666666"))[† Equal contribution · ‡ Co-corresponding author]
]
{% endif %}
{% if entry_type in ["ReversedNumberedEntry"] %}

#reversed-numbered-entries(
  [
{% endif %}
