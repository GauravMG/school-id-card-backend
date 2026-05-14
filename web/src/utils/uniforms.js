import blueShirtTie from 'assets/images/uniforms/blue_shirt_tie.png';
import whiteShirtSweater from 'assets/images/uniforms/white_shirt_sweater.png';
import redBlazer from 'assets/images/uniforms/red_blazer.png';
import whiteShirtTie from 'assets/images/uniforms/white_shirt_tie.png';
import blackSuit from 'assets/images/uniforms/black_suit.png';

export const uniformOptions = [
  { id: 'blue_shirt_tie', name: 'Blue Shirt & Tie', image: blueShirtTie },
  { id: 'white_shirt_sweater', name: 'White Shirt & Sweater', image: whiteShirtSweater },
  { id: 'red_blazer', name: 'Red Blazer', image: redBlazer },
  { id: 'white_shirt_tie', name: 'White Shirt & Tie', image: whiteShirtTie },
  { id: 'black_suit', name: 'Black Suit', image: blackSuit },
  { id: 'none', name: 'No Uniform Overlay', image: '' }
];

export const getUniformImage = (id) => {
  const uniform = uniformOptions.find(u => u.id === id);
  return uniform ? uniform.image : '';
};
