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
        <span class="skill-tag" data-skill="{{ skill }}">{{ skill }}</span>
      {% endfor %}
    </div>
  {% endif %}
</main>

<script>
const skillProjects = {
  {% for skill in skills_list %}
  {{ skill | jsonify }}: [
    {% for project in site.projects %}
      {% if project.skills contains skill %}
        {{ project.url | relative_url | jsonify }},
      {% endif %}
    {% endfor %}
  ],
  {% endfor %}
};

document.querySelectorAll('.skill-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    const projects = skillProjects[tag.dataset.skill] || [];
    if (projects.length) {
      window.location = projects[Math.floor(Math.random() * projects.length)];
    }
  });
});
</script>
