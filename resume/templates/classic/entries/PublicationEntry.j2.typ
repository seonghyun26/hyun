{# Leave the two-column row empty and use the full-width row for publications. #}
#regular-entry(
  [ ],
  [ ],
  main-column-second-row: [
{% for line in entry.main_column.splitlines() %}
{% if loop.first %}
    #text(size: 11pt)[{{ line }}]
{% else %}
    {{ line|indent(4) }}
{% endif %}

{% endfor %}
  ],
)
