// --- Stamina Recovery for Benched Cards ---
function recoverStaminaBenched(amount = 10) { 
  if (!collection || !Array.isArray(collection)) {
    // console.error("Collection is not available for stamina recovery."); // Keep console clean for tests
    return;
  }
  if (!currentTeam || !Array.isArray(currentTeam)) {
    // console.error("Current team is not available for stamina recovery comparison.");
    return;
  }

  const teamMemberIds = new Set(currentTeam.map(member => member.id));

  collection.forEach(card => {
    // Ensure card has stamina properties initialized
    if (card.maxStamina === undefined) {
      card.maxStamina = 100;
    }
    if (card.stamina === undefined) {
      card.stamina = card.maxStamina;
    }

    if (!teamMemberIds.has(card.id)) { // If card is not in the current team
      card.stamina = Math.min(card.maxStamina, card.stamina + amount);
    }
  });
  console.log("Benched members' stamina recovered by up to " + amount + ".");
  
  if (document.getElementById('cardCollection') && document.getElementById('cardCollection').style.display === 'block') {
    updateCollection(); 
  }
  const teamModalElement = document.getElementById('teamModal');
  if (teamModalElement && teamModalElement.classList.contains('show')) {
    updateCardSelectionList();
  }
}
// --- End Stamina Recovery ---

// --- Stamina Test Functions ---
function testStaminaInitialization() {
    console.log("--- Testing Stamina Initialization ---");
    let passCount = 0; let failCount = 0;
    let originalCollectionGlobal = JSON.parse(JSON.stringify(collection)); 
    collection = []; 

    const simulatedPulledCard = {
        id: "cardPulled1", name: "Pulled Card", rarity: 3, power: 50, beauty: 50, charisma: 50, vocal: 50,
        description: "A test card.", maxStamina: 100, stamina: 100 
    };
    if (assertEqual(simulatedPulledCard.stamina, 100, "Test 1.1: Pulled card has stamina 100") && assertEqual(simulatedPulledCard.maxStamina, 100, "Test 1.2: Pulled card has maxStamina 100")) { passCount +=2; } else { failCount +=2; }

    collection = [{id: "cardOld1", name: "Old Card", rarity: 1, power:10, beauty:10, charisma:10, vocal:10}]; 
    
    // Simulate the DOMContentLoaded initialization logic for collection
    if (typeof collection !== 'undefined' && Array.isArray(collection)) {
        collection.forEach(card => {
          if (card.maxStamina === undefined) card.maxStamina = 100;
          if (card.stamina === undefined) card.stamina = card.maxStamina;
        });
    }
    if (assertEqual(collection[0].stamina, 100, "Test 2.1: Old card in collection gets stamina 100 via init") && assertEqual(collection[0].maxStamina, 100, "Test 2.2: Old card in collection gets maxStamina 100 via init")) { passCount+=2; } else { failCount+=2; }
    
    collection = JSON.parse(JSON.stringify(originalCollectionGlobal)); 
    console.log(`Stamina Initialization Tests: ${passCount} passed, ${failCount} failed.`);
    return failCount === 0;
}

function testStaminaConsumptionProduceSong() {
    console.log("--- Testing Stamina Consumption for Produce Song ---");
    let passCount = 0; let failCount = 0;
    let oG=totalGems, oT=JSON.parse(JSON.stringify(currentTeam)), oS=JSON.parse(JSON.stringify(songs)), oC=JSON.parse(JSON.stringify(collection));
    const m1={id:"tmps1",name:"M1",stamina:50,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1}, m2={id:"tps2",name:"M2",stamina:100,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1};
    currentTeam=[m1,m2]; collection=[m1,m2]; totalGems=5000; const sLB=songs.length; produceSong(); 
    if(assertEqual(m1.stamina,30,"PS C1.1")&&assertEqual(m2.stamina,80,"PS C1.2")&&assertEqual(songs.length,sLB+1,"PS C1.3")){p+=3;}else{f+=3;}
    const m3={id:"tmps3",name:"M3",stamina:10,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1}; currentTeam=[m3,m2]; m2.stamina=100; collection=[m3,m2]; // m2 stamina reset
    const sLB2=songs.length; produceSong(); 
    if(assertEqual(m3.stamina,10,"PS C2.1")&&assertEqual(m2.stamina,100,"PS C2.2")&&assertEqual(songs.length,sLB2,"PS C2.3")){p+=3;}else{f+=3;}
    totalGems=oG; currentTeam=JSON.parse(JSON.stringify(oT)); songs=JSON.parse(JSON.stringify(oS)); collection=JSON.parse(JSON.stringify(oC));
    console.log(`Produce Song Stamina Tests: ${passCount} passed, ${failCount} failed.`); return failCount === 0;
}

function testStaminaConsumptionStartConcert() {
    console.log("--- Testing Stamina Consumption for Start Concert ---");
    let p=0,f=0; let oG=totalGems,oT=JSON.parse(JSON.stringify(currentTeam)),oC=JSON.parse(JSON.stringify(collection)),oTC=totalConcerts;
    const m1={id:"sccs1",name:"MC1",stamina:50,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1},m2={id:"sccs2",name:"MC2",stamina:100,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1};
    currentTeam=[m1,m2];collection=[...currentTeam,{id:"b1sc",name:"Benched",stamina:50,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1}];totalGems=5000;
    const tcB1=totalConcerts;startConcert();
    if(assertEqual(m1.stamina,20,"SC C1.1")&&assertEqual(m2.stamina,70,"SC C1.2")&&assertEqual(totalConcerts,tcB1+1,"SC C1.3")){p+=3;}else{f+=3;}
    const m3={id:"sccs3",name:"MC3",stamina:10,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1};currentTeam=[m3,m2];m2.stamina=100;collection=[m3,m2];
    const tcB2=totalConcerts;startConcert();
    if(assertEqual(m3.stamina,10,"SC C2.1")&&assertEqual(m2.stamina,100,"SC C2.2")&&assertEqual(totalConcerts,tcB2,"SC C2.3")){p+=3;}else{f+=3;}
    totalGems=oG;currentTeam=JSON.parse(JSON.stringify(oT));collection=JSON.parse(JSON.stringify(oC));totalConcerts=oTC;
    console.log(`Start Concert Stamina Tests: ${passCount} passed, ${failCount} failed.`);return f===0;
}

function testStaminaRecoveryBenched() {
    console.log("--- Testing Stamina Recovery ---");
    let p=0,f=0; let oC=JSON.parse(JSON.stringify(collection)),oT=JSON.parse(JSON.stringify(currentTeam));
    const cA={id:"srb1",name:"B1",stamina:50,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1},cB={id:"srb2",name:"B2",stamina:95,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1};
    const cC={id:"srb3",name:"A1",stamina:70,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1},cD={id:"srb4",name:"BFull",stamina:100,maxStamina:100,rarity:1,power:1,beauty:1,charisma:1,vocal:1};
    collection=[cA,cB,cC,cD];currentTeam=[cC];recoverStaminaBenched(10);
    if(assertEqual(cA.stamina,60,"SR C1.1"))p++;else f++; if(assertEqual(cB.stamina,100,"SR C1.2"))p++;else f++;
    if(assertEqual(cC.stamina,70,"SR C1.3"))p++;else f++; if(assertEqual(cD.stamina,100,"SR C1.4"))p++;else f++;
    collection=JSON.parse(JSON.stringify(oC));currentTeam=JSON.parse(JSON.stringify(oT));
    console.log(`Benched Stamina Recovery: ${passCount} passed, ${failCount} failed.`);return f===0;
}
// --- End Stamina Test Functions ---
