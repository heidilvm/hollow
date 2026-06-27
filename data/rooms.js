// ============================================
// data/rooms.js — Mackenzie Avenue (complete replacement)
// ============================================

const mackenzieAvenue = {

  id: 'mackenzie_avenue',
  background: 'mackenzie-avenue.png',

  // ---- ARRIVAL TEXT (click-to-advance, before hotspots activate) ----
  arrivalSequence: [
    "Mackenzie Avenue.",
    "Four days since anyone last saw June Rees. Someone in this street knows where she went."
  ],

  // ---- HOTSPOTS ----
  hotspots: [

    {
      id: 'dish',
      left: '4%', top: '13%', width: '11%', height: '11%',
      debugBorder: false,

      onClick: (state) => {
        setFlag(state, 'saw_dish');
        return {
          type: 'plain_text',
          text: "A dish-shaped aerial, bolted to the roof of the hardware store. Bigger than the ones on the houses. It points up the valley, at the mountain."
        };
      }
    },

    {
      id: 'hardware_sign',
      left: '2%', top: '20%', width: '22%', height: '12%',
      debugBorder: false,

      onClick: (state) => {
        setFlag(state, 'saw_date');
        return {
          type: 'plain_text',
          text: "REES HARDWARE. The lights are off. It has been six months since anyone opened it. A torn calendar still hangs in the window — October 1955."
        };
      }
    },

    {
      id: 'mountain',
      left: '32%', top: '6%', width: '37%', height: '42%',
      debugBorder: false,

      onClick: (state) => {
        console.log('Mountain clicked. Current flags:', JSON.stringify(state.flags));
        const noticed = hasFlag(state, 'saw_dish') && hasFlag(state, 'saw_date');

        if (!noticed) {
          return {
            type: 'plain_text',
            text: "Just the mountain. Snow on the high faces."
          };
        }

        setFlag(state, 'noticed_dish_contradiction');
        return {
          type: 'plain_text',
          text: "Just the mountain. Snow on the high faces. You keep looking anyway.",
          advancesStory: true
        };
      }
    },

    {
      id: 'gap',
      left: '25%', top: '48%', width: '10%', height: '32%',
      debugBorder: false,

      onClick: (state) => ({
        type: 'plain_text',
        text: "Two stone pillars, standing alone. Nothing built between them. There used to be."
      })
    },

    {
      id: 'truck',
      left: '73%', top: '78%', width: '24%', height: '20%',
      debugBorder: false,

      onClick: (state) => ({
        type: 'plain_text',
        text: "A 1949 Ford pickup. Local plates. The bed has mud on it — mountain mud, darker than the valley soil."
      })
    },

    {
      id: 'diner_sign',
      left: '82%', top: '38%', width: '17%', height: '14%',
      debugBorder: false,

      onClick: (state) => ({
        type: 'navigate',
        to: 'kowalskis_diner'
      })
    }

  ]
};
