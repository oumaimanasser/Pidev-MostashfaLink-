import React from 'react';
import './About.css';
import About_img from '../../assests/About_img.avif';
import Team1 from '../../assests/team1.jpg';
import Team2 from '../../assests/team2.jpg';
import Team3 from '../../assests/team3.avif';
import Navbar from '../Navbar/Navbar';
import { useEffect } from 'react';
import { useAnimation, motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function About() {
  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const imageVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  const teamVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const memberVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <>
      <Navbar />
      <div className='about-container'>
        <div className='about'>
          <motion.div 
            className="about-left"
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={imageVariants}
          >
            <img src={About_img} alt="Urgences hospitalières" className='About_img' />
          </motion.div>
          <div className="about-right">
            <h2>À PROPOS DE MOSTACHFALINK</h2>
            <p>
              <strong>MostachfaLink</strong> est une plateforme intelligente dédiée à la gestion efficace des urgences hospitalières. Notre objectif est de faciliter l&apos;accès rapide aux lits disponibles, d&apos;optimiser le suivi des patients hospitalisés et d&apos;améliorer la coordination entre les structures de santé.
            </p>
            <p>
              Grâce à une interface intuitive, les professionnels de santé peuvent suivre en temps réel l&apos;occupation des lits, ajouter ou transférer des patients, recevoir des alertes, et consulter des statistiques essentielles pour une prise de décision rapide.
            </p>
            <p>
              MostachfaLink permet aussi aux responsables hospitaliers de mieux gérer les ressources, d&apos;anticiper les situations de surcharge et d&apos;assurer une réponse rapide et adaptée aux urgences médicales.
            </p>
          </div>
        </div>

        {/* Our Vision Section */}
        <div className="vision-section">
          <div className="vision-content">
            <h2>Notre Vision</h2>
            <p>
              Nous envisageons un système de santé où chaque patient reçoit des soins rapides et appropriés, où les hôpitaux fonctionnent de manière optimale, et où les professionnels de santé ont accès aux outils les plus modernes pour sauver des vies.
            </p>
            <p>
              MostachfaLink vise à révolutionner la gestion des urgences en Afrique et au-delà, en utilisant la technologie pour réduire les temps d&apos;attente et améliorer les résultats pour les patients.
            </p>
          </div>
        </div>

        {/* Our Team Section */}
        <div className="team-section">
          <h2>Notre Équipe</h2>
          <motion.div 
            className="team-members"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={teamVariants}
          >
            <motion.div className="team-member" variants={memberVariants}>
              <img src={Team1} alt="Membre de l&apos;équipe 1" />
              <h3>Dr. Ahmed Benali</h3>
              <p>Directeur Médical</p>
            </motion.div>
            <motion.div className="team-member" variants={memberVariants}>
              <img src={Team2} alt="Membre de l&apos;équipe 2" />
              <h3>Fatima Zohra</h3>
              <p>Responsable Développement</p>
            </motion.div>
            <motion.div className="team-member" variants={memberVariants}>
              <img src={Team3} alt="Membre de l&apos;équipe 3" />
              <h3>Karim Bensaid</h3>
              <p>Expert en Systèmes de Santé</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default About;