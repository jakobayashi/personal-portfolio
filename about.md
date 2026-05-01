---
layout: default
title: About
permalink: /about/
---
<main class="about">
  <h1>About</h1>
  <p>Content coming soon.</p>

  {% assign skills_list = "" | split: "" %}
  {% for project in site.projects %}
    {% for skill in project.skills %}
      {% unless skills_list contains skill %}
        {% assign skills_list = skills_list | push: skill %}
      {% endunless %}
    {% endfor %}
  {% endfor %}
  {% assign skills_list = skills_list | sort %}
  {% if skills_list.size > 0 %}
    <div class="about-skills">
      {% for skill in skills_list %}
        <span class="skill-tag" data-skill="{{ skill }}">{{ skill }}</span>
      {% endfor %}
    </div>
  {% endif %}

  {% assign tools_list = "" | split: "" %}
  {% for project in site.projects %}
    {% for tool in project.tools %}
      {% unless tools_list contains tool %}
        {% assign tools_list = tools_list | push: tool %}
      {% endunless %}
    {% endfor %}
  {% endfor %}
  {% assign tools_list = tools_list | sort %}
  {% if tools_list.size > 0 %}
    <div class="about-skills">
      {% for tool in tools_list %}
        <span class="skill-tag" data-tool="{{ tool }}">{{ tool }}</span>
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

const toolProjects = {
  {% for tool in tools_list %}
  {{ tool | jsonify }}: [
    {% for project in site.projects %}
      {% if project.tools contains tool %}
        {{ project.url | relative_url | jsonify }},
      {% endif %}
    {% endfor %}
  ],
  {% endfor %}
};

document.querySelectorAll('[data-skill]').forEach(tag => {
  tag.addEventListener('click', () => {
    const projects = skillProjects[tag.dataset.skill] || [];
    if (projects.length) {
      window.location = projects[Math.floor(Math.random() * projects.length)];
    }
  });
});

document.querySelectorAll('[data-tool]').forEach(tag => {
  tag.addEventListener('click', () => {
    const projects = toolProjects[tag.dataset.tool] || [];
    if (projects.length) {
      window.location = projects[Math.floor(Math.random() * projects.length)];
    }
  });
});
</script>
