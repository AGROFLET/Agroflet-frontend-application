<script setup>
import {useI18n} from "vue-i18n";
import PageHeader from "../components/page-header.vue";

const {t} = useI18n();

/** Photos in public/images/team, under the base path the application is published at (GitHub Pages uses a subpath). */
const photo = file => `${import.meta.env.BASE_URL}images/team/${file}`;

const team = [
  {name: 'Alca Morán, César Alejandro', photo: photo('cesar.webp')},
  {name: 'Centeno León, Adriano Samir', photo: photo('adriano.webp')},
  {name: 'Rivas Méndez, Bernie Aarón', photo: photo('bernie.webp')},
  {name: 'Rivas Castillo, Christoper Steven', photo: photo('christoper.webp')},
  {name: 'Tello Lima, Jose Alejandro', photo: photo('jose.webp')}
];
</script>

<template>
  <section class="about">
    <page-header :description="t('about.description')" :eyebrow="t('about.eyebrow')" :title="t('about.title')"/>
    <div class="grid">
      <div class="col-12 md:col-6">
        <div class="agf-card h-full">
          <h2 class="mb-2">{{ t('about.mission-title') }}</h2>
          <p class="agf-muted m-0">{{ t('about.mission') }}</p>
        </div>
      </div>
      <div class="col-12 md:col-6">
        <div class="agf-card h-full">
          <h2 class="mb-2">{{ t('about.vision-title') }}</h2>
          <p class="agf-muted m-0">{{ t('about.vision') }}</p>
        </div>
      </div>
    </div>
    <h2 class="mt-5 mb-3">{{ t('about.team-title') }}</h2>
    <ul class="about__team">
      <li v-for="member in team" :key="member.name" class="agf-card about__member">
        <img :alt="member.name" :src="member.photo" class="about__photo" loading="lazy"/>
        <span class="font-medium">{{ member.name }}</span>
        <span class="agf-caption">{{ t('about.career') }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.about {
  max-width: 1100px;
  margin: 0 auto;
}

.about__team {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--agf-space-4);
  list-style: none;
  padding: 0;
  margin: 0;
}

.about__member {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--agf-space-2);
  padding: var(--agf-space-4);
}

.about__photo {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
