"use client";
import React from "react";
import { motion, Variants } from "framer-motion"; // 👈 Додали імпорт Variants
import { useLanguage } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import uk from "@/locales/uk.json";
import pl from "@/locales/pl.json";
import { FaReact, FaNodeJs, FaFigma, FaGithub, FaServer, FaCode, FaHtml5 } from "react-icons/fa";
import { SiTypescript, SiMongodb, SiPostman, SiNextdotjs, SiTailwindcss, SiExpress, SiJavascript } from "react-icons/si";
import { VscTerminalBash } from "react-icons/vsc";
import "./Skills.scss";

const translations: any = { en, uk, pl };

const Skills = () => {
  const { lang } = useLanguage();
  const t = (path: string) => {
    const keys = path.split('.');
    let res = translations[lang];
    keys.forEach(k => { if (res) res = res[k]; });
    return res || path;
  };

  // 👈 Додали тип Variants, щоб TypeScript був спокійний
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  // 👈 Додали тип Variants і 'as const' для spring
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 90 } }
  };

  return (
    <section className="skills-master-section" id="skills">
      {/* ФОНОВОЕ СВЕЧЕНИЕ */}
      <div className="ambient-glow center-right"></div>
      <div className="ambient-glow bottom-left"></div>

      <div className="skills-safe-area">
        
        <motion.div className="skills-header" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }}>
          <h2 className="section-title">
            <span className="accent-number">02.</span> SYSTEM_LOG // <span className="glow-text">{t('skills.section_title')}</span>
          </h2>
          <div className="header-line"></div>
        </motion.div>

        <motion.div className="glass-grid" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          
          <motion.div className="glass-panel core-panel" variants={itemVariants}>
            <div className="panel-header">
              <FaCode className="header-icon" />
              <h3>{t('skills.primary_stack')}</h3>
            </div>
            
            <div className="core-content">
              {/* Frontend */}
              <div className="tech-group">
                <h4 className="group-title">_FRONTEND & CORE</h4>
                <div className="tech-items">
                  <div className="tech-pill"><SiJavascript className="i" /> JavaScript</div>
                  <div className="tech-pill"><FaHtml5 className="i" /> HTML / CSS</div>
                  <div className="tech-pill"><FaReact className="i" /> React</div>
                  <div className="tech-pill"><SiNextdotjs className="i" /> Next.js</div>
                  <div className="tech-pill"><SiTypescript className="i" /> TypeScript</div>
                  <div className="tech-pill"><SiTailwindcss className="i" /> Tailwind / SCSS</div>
                </div>
              </div>

              <div className="divider"></div>

              {/* Backend */}
              <div className="tech-group">
                <h4 className="group-title">_BACKEND & DATA</h4>
                <div className="tech-items">
                  <div className="tech-pill"><FaNodeJs className="i" /> Node.js</div>
                  <div className="tech-pill"><SiExpress className="i" /> Express</div>
                  <div className="tech-pill"><SiMongodb className="i" /> MongoDB</div>
                  <div className="tech-pill"><FaServer className="i" /> REST API</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="side-column">
            
            <motion.div className="glass-panel tools-panel" variants={itemVariants}>
              <div className="panel-header">
                <h3>{t('skills.dev_tools')}</h3>
              </div>
              <ul className="tools-list">
                <li><FaGithub className="i" /> Git & GitHub</li>
                <li><FaFigma className="i" /> Figma UI/UX</li>
                <li><SiPostman className="i" /> Postman API</li>
                <li><VscTerminalBash className="i" /> Terminal Bash</li>
              </ul>
            </motion.div>

            <motion.div className="glass-panel langs-panel" variants={itemVariants}>
              <div className="panel-header">
                <h3>{t('skills.languages')}</h3>
              </div>
              <div className="lang-lines">
                <div className="lang-line">
                  <div className="lang-info"><span>UKR / RUS</span> <span>{t('skills.lang_native')}</span></div>
                  <div className="line-bg"><motion.div className="line-fill red" initial={{width:0}} whileInView={{width:'100%'}} viewport={{once:true}} transition={{duration:1}}/></div>
                </div>
                <div className="lang-line">
                  <div className="lang-info"><span>POLISH (PL)</span> <span>{t('skills.lang_fluent')}</span></div>
                  <div className="line-bg"><motion.div className="line-fill red" initial={{width:0}} whileInView={{width:'85%'}} viewport={{once:true}} transition={{duration:1, delay: 0.1}}/></div>
                </div>
                <div className="lang-line">
                  <div className="lang-info"><span>GERMAN (DE)</span> <span>{t('skills.lang_b1')}</span></div>
                  <div className="line-bg"><motion.div className="line-fill yellow" initial={{width:0}} whileInView={{width:'55%'}} viewport={{once:true}} transition={{duration:1, delay: 0.2}}/></div>
                </div>
                <div className="lang-line">
                  <div className="lang-info"><span>ENGLISH (EN)</span> <span>{t('skills.lang_a2')}</span></div>
                  <div className="line-bg"><motion.div className="line-fill orange" initial={{width:0}} whileInView={{width:'35%'}} viewport={{once:true}} transition={{duration:1, delay: 0.3}}/></div>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;