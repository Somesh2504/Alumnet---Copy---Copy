import React from 'react';
import PageTransitionNoLoading from '../components/PageTransitionNoLoading';
import './About.css';

const About = () => (
  <PageTransitionNoLoading>
    <div className="alumnet-background">
      <div className="about-container">
        <h1>About AlumNET</h1>
        <p>
          AlumNET is a platform connecting students and alumni for mentorship, networking, and career growth.
          Our mission is to empower the next generation through shared experiences and guidance.
        </p>
        <h2>Our Team</h2>
        <ul>
          <li>Somesh - Founder & Developer</li>
          {/* Add more team members if needed */}
        </ul>
      </div>
    </div>
  </PageTransitionNoLoading>
);

export default About;