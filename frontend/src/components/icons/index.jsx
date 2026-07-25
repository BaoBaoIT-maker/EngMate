import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faLayerGroup, faGamepad, faMicrophone, 
  faGear, faSun, faMoon, faChevronLeft, faPaperPlane, faStar as faStarSolid 
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

export const Icon = {
  home: (c) => <FontAwesomeIcon icon={faHome} style={{ color: c, fontSize: '1.25rem' }} />,
  cards: (c) => <FontAwesomeIcon icon={faLayerGroup} style={{ color: c, fontSize: '1.25rem' }} />,
  games: (c) => <FontAwesomeIcon icon={faGamepad} style={{ color: c, fontSize: '1.25rem' }} />,
  mic: (c) => <FontAwesomeIcon icon={faMicrophone} style={{ color: c, fontSize: '1.25rem' }} />,
  settings: (c) => <FontAwesomeIcon icon={faGear} style={{ color: c, fontSize: '1.25rem' }} />,
  sun: (c) => <FontAwesomeIcon icon={faSun} style={{ color: c, fontSize: '1.1rem' }} />,
  moon: (c) => <FontAwesomeIcon icon={faMoon} style={{ color: c, fontSize: '1.1rem' }} />,
  chevron: (c) => <FontAwesomeIcon icon={faChevronLeft} style={{ color: c, fontSize: '1rem' }} />,
  send: (c) => <FontAwesomeIcon icon={faPaperPlane} style={{ color: c, fontSize: '1.1rem' }} />,
  star: (c, filled) => <FontAwesomeIcon icon={filled ? faStarSolid : faStarRegular} style={{ color: c, fontSize: '1rem' }} />,
};
