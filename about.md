---
layout: default
title: About
permalink: /about/
---
<main class="about">
  <h1>About</h1>
  <p>Content coming soon.</p>

  {% assign all_skills = "" %}
  {% for project in site.projects %}
    {% if project.skills %}
      {% if all_skills == "" %}
        {% assign all_skills = project.skills %}
      {% else %}
        {% assign all_skills = all_skills | append: ", " | append: project.skills %}
      {% endif %}
    {% endif %}
  {% endfor %}

  {% assign skills_list = all_skills | split: ", " | uniq | sort %}
  {% if skills_list.size > 0 %}
    <div class="about-skills">
      {% for skill in skills_list %}
        <span class="skill-tag">{{ skill }}</span>
      {% endfor %}
    </div>
  {% endif %}
</main>
