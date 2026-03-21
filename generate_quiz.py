import json
import random

quiz_data = {}

def get_options(correct, wrong_list):
    opts = [correct] + random.sample(wrong_list, min(3, len(wrong_list)))
    random.shuffle(opts)
    return opts

def math_q(cls):
    qs = []
    topics_1_3 = ["addition", "subtraction"]
    topics_4_6 = ["multiplication", "division", "addition"]
    topics_7_10 = ["algebra", "percentages", "fractions"]
    
    for _ in range(20):
        if cls <= 3:
            a, b = random.randint(1, 10 + cls*5), random.randint(1, 10 + cls*5)
            op = random.choice(topics_1_3)
            if op == "subtraction": a, b = max(a,b), min(a,b)
            ans = a + b if op == "addition" else a - b
            wrongs = [str(ans+1), str(abs(ans-1)), str(ans+2), str(abs(ans-2)), str(ans+10), str(abs(ans-10))]
            qs.append({
                "question": f"What is {a} {'+' if op == 'addition' else '-'} {b}?",
                "options": get_options(str(ans), list(set(wrongs))),
                "answer": str(ans),
                "topic": op,
                "difficulty": "easy"
            })
        elif cls <= 6:
            op = random.choice(topics_4_6)
            if op == "multiplication":
                a, b = random.randint(2, 15), random.randint(2, 12)
                ans = a * b
                wrongs = [str(ans+a), str(abs(ans-b)), str(ans+1), str(ans+10)]
                q = f"What is {a} x {b}?"
            elif op == "division":
                b = random.randint(2, 12)
                ans = random.randint(2, 15)
                a = b * ans
                wrongs = [str(ans+1), str(abs(ans-1)), str(ans+2), str(ans*2)]
                q = f"What is {a} ÷ {b}?"
            else:
                a, b = random.randint(100, 999), random.randint(100, 999)
                ans = a + b
                wrongs = [str(ans+10), str(ans-10), str(ans+100), str(ans-100)]
                q = f"What is {a} + {b}?"
                
            qs.append({
                "question": q,
                "options": get_options(str(ans), list(set(wrongs))),
                "answer": str(ans),
                "topic": op,
                "difficulty": "medium"
            })
        else:
            op = random.choice(topics_7_10)
            if op == "algebra":
                x = random.randint(1, 12)
                a = random.randint(2, 9)
                b = random.randint(1, 20)
                c = a * x + b
                ans = str(x)
                wrongs = [str(x+1), str(abs(x-1)), str(x+a), str(abs(x-b))]
                q = f"Solve for x: {a}x + {b} = {c}"
            elif op == "percentages":
                pct = random.choice([10, 20, 25, 30, 40, 50, 60, 75, 80, 90])
                val = random.randint(5, 50) * 10
                ans = int(val * (pct / 100))
                wrongs = [str(ans+10), str(abs(ans-10)), str(ans+5), str(abs(ans-5))]
                q = f"What is {pct}% of {val}?"
            else:
                denom = random.choice([2, 4, 5, 10])
                num = random.randint(1, denom-1)
                ans_dec = num / denom
                ans = str(ans_dec)
                wrongs = [str(round(ans_dec+0.1, 2)), str(round(abs(ans_dec-0.1), 2)), str(round(ans_dec+0.2, 2)), str(round(abs(ans_dec-0.2), 2))]
                q = f"Convert the fraction {num}/{denom} to a decimal."
                
            qs.append({
                "question": q,
                "options": get_options(ans, list(set(wrongs))),
                "answer": ans,
                "topic": op,
                "difficulty": "hard"
            })
    return qs

def get_eng(cls):
    qs = []
    # Dynamic templates for English
    animals = ["cat", "dog", "elephant", "tiger", "lion", "rabbit", "deer", "bear", "monkey", "horse"]
    antonyms = {"hot":"cold", "fast":"slow", "big":"small", "tall":"short", "happy":"sad", "good":"bad", "day":"night", "up":"down", "rich":"poor", "hard":"soft", "heavy":"light", "thick":"thin", "wet":"dry", "clean":"dirty", "strong":"weak"}
    synonyms = {"happy":"joyful", "fast":"quick", "big":"large", "smart":"clever", "sad":"sorrowful", "rich":"wealthy", "hard":"difficult", "easy":"simple", "beautiful":"pretty", "angry":"furious", "tired":"exhausted", "cold":"chilly", "hot":"boiling", "small":"tiny", "strong":"powerful"}
    grammar_1_3 = [
        ("Identify the noun:", "The dog barks.", "dog", ["The", "barks", "."]),
        ("Identify the pronoun:", "He is eating an apple.", "He", ["is", "eating", "apple"]),
        ("Identify the verb:", "She runs fast.", "runs", ["She", "fast", "."]),
        ("Choose the correct article:", "___ apple a day keeps the doctor away.", "An", ["A", "The", "No article"]),
        ("Choose the correct spelling:", "Correct spelling for color?", "Color", ["Coler", "Kolar", "Culer"])
    ]
    grammar_4_6 = [
        ("Identify the adjective:", "The quick brown fox jumps.", "quick", ["fox", "jumps", "The"]),
        ("Identify the adverb:", "He sings loudly.", "loudly", ["He", "sings", "."]),
        ("Choose the correct preposition:", "The cat is ___ the table.", "under", ["between", "over", "into"]),
        ("What tense is this?", "I walked to school.", "Past", ["Present", "Future", "Continuous"]),
        ("Choose the plural:", "What is the plural of 'child'?", "children", ["childs", "childes", "childrens"])
    ]
    grammar_7_10 = [
        ("Identify the conjunction:", "I wanted to go, but I was tired.", "but", ["I", "wanted", "tired"]),
        ("Choose the correct voice:", "The ball was thrown by him. (Identify voice)", "Passive", ["Active", "Direct", "Indirect"]),
        ("Identify the tense:", "I have been working for 2 hours.", "Present Perfect Continuous", ["Simple Past", "Present Continuous", "Past Perfect"]),
        ("Find the synonym:", "What is the synonym of 'Abundant'?", "Plentiful", ["Scarce", "Rare", "Empty"])
    ]
    
    for i in range(15):
        if cls <= 3:
            choice = random.randint(1, 3)
            if choice == 1:
                word = random.choice(list(antonyms.keys()))
                ans = antonyms[word]
                wrongs = list(antonyms.values()); wrongs.remove(ans)
                qs.append({"question": f"What is the opposite (antonym) of '{word}'?", "options": get_options(ans, wrongs), "answer": ans, "topic": "vocabulary", "difficulty": "easy"})
            else:
                q, s, a, w = random.choice(grammar_1_3)
                qs.append({"question": f"{q} '{s}'", "options": get_options(a, w), "answer": a, "topic": "grammar", "difficulty": "easy"})
        elif cls <= 6:
            choice = random.randint(1, 3)
            if choice == 1:
                word = random.choice(list(synonyms.keys()))
                ans = synonyms[word]
                wrongs = list(synonyms.values()); wrongs.remove(ans)
                qs.append({"question": f"What is the synonym of '{word}'?", "options": get_options(ans, wrongs), "answer": ans, "topic": "vocabulary", "difficulty": "medium"})
            else:
                q, s, a, w = random.choice(grammar_4_6)
                qs.append({"question": f"{q} '{s}'", "options": get_options(a, w), "answer": a, "topic": "grammar", "difficulty": "medium"})
        else:
            q, s, a, w = random.choice(grammar_7_10)
            qs.append({"question": f"{q} '{s}'", "options": get_options(a, w), "answer": a, "topic": "grammar", "difficulty": "hard"})
            
    # Ensure exactly 15 by appending distinct variants if needed
    while len(qs) < 15:
        # Just random antonyms/synonyms
        word = random.choice(list(antonyms.keys()))
        ans = antonyms[word]
        wrongs = list(antonyms.values()); wrongs.remove(ans)
        qs.append({"question": f"What is the opposite (antonym) of '{word}'? (Variant {random.randint(1,1000)})", "options": get_options(ans, wrongs), "answer": ans, "topic": "vocabulary", "difficulty": "hard"})
    return qs[:15]

def get_sci(cls):
    qs = []
    
    sci_1_3_facts = [
        ("What does a cow give us?", "Milk", ["Water", "Honey", "Eggs"]),
        ("How many legs does a spider have?", "8", ["6", "4", "10"]),
        ("Which part of the plant is under the ground?", "Root", ["Leaf", "Stem", "Flower"]),
        ("What color is the sky on a clear day?", "Blue", ["Green", "Red", "Yellow"]),
        ("What do we breathe to stay alive?", "Air", ["Water", "Fire", "Soil"]),
        ("Which animal is known as the king of the jungle?", "Lion", ["Tiger", "Elephant", "Bear"]),
        ("How many senses do humans have?", "5", ["3", "4", "6"]),
        ("Which is the largest land animal?", "Elephant", ["Giraffe", "Hippo", "Rhino"]),
        ("What do birds use to fly?", "Wings", ["Legs", "Tails", "Beaks"]),
        ("What comes after night?", "Day", ["Evening", "Afternoon", "Midnight"])
    ]
    
    sci_4_6_facts = [
        ("Which planet is known as the Red Planet?", "Mars", ["Venus", "Jupiter", "Saturn"]),
        ("What is the boiling point of water in Celsius?", "100", ["50", "90", "120"]),
        ("What gas do plants absorb from the atmosphere?", "Carbon dioxide", ["Oxygen", "Nitrogen", "Hydrogen"]),
        ("What is the hardest natural substance on Earth?", "Diamond", ["Gold", "Iron", "Quartz"]),
        ("How many planets are in our solar system?", "8", ["7", "9", "10"]),
        ("What is the closest star to Earth?", "The Sun", ["Sirius", "Alpha Centauri", "Polaris"]),
        ("What part of the plant conducts photosynthesis?", "Leaves", ["Roots", "Stem", "Flowers"]),
        ("Which of these is a magnetic metal?", "Iron", ["Copper", "Aluminum", "Gold"]),
        ("What force pulls objects towards the Earth?", "Gravity", ["Friction", "Magnetism", "Tension"]),
        ("What is the center of an atom called?", "Nucleus", ["Proton", "Electron", "Neutron"])
    ]
    
    sci_7_10_facts = [
        ("What is the chemical symbol for Gold?", "Au", ["Ag", "Go", "Gd"]),
        ("What is the powerhouse of the cell?", "Mitochondria", ["Nucleus", "Ribosome", "Endoplasmic Reticulum"]),
        ("What is the SI unit of Force?", "Newton", ["Joule", "Pascal", "Watt"]),
        ("What is the chemical formula for water?", "H2O", ["CO2", "O2", "NaCl"]),
        ("What particle has a negative charge?", "Electron", ["Proton", "Neutron", "Positron"]),
        ("What type of lens is used to correct myopia?", "Concave", ["Convex", "Bifocal", "Plano-convex"]),
        ("Who proposed the theory of relativity?", "Albert Einstein", ["Isaac Newton", "Niels Bohr", "Galileo Galilei"]),
        ("What is the most abundant gas in the Earth's atmosphere?", "Nitrogen", ["Oxygen", "Argon", "Carbon Dioxide"]),
        ("What is the speed of light in a vacuum?", "3x10^8 m/s", ["3x10^6 m/s", "3x10^5 m/s", "3x10^10 m/s"]),
        ("What is the pH level of pure water?", "7", ["0", "14", "5"])
    ]

    for i in range(15):
        if cls <= 3:
            fact = random.choice(sci_1_3_facts)
            diff = "easy"
        elif cls <= 6:
            fact = random.choice(sci_4_6_facts)
            diff = "medium"
        else:
            fact = random.choice(sci_7_10_facts)
            diff = "hard"
            
        q, a, w = fact
        # Append variant id to avoid duplicates if drawn multiple times
        variant = f" (Variant {i})" if i > 9 else ""
        qs.append({
            "question": q + variant,
            "options": get_options(a, w),
            "answer": a,
            "topic": "general science",
            "difficulty": diff
        })
    return qs

for cls_level in range(1, 11):
    cls_str = str(cls_level)
    quiz_data[cls_str] = {
        "math": math_q(cls_level),
        "science": get_sci(cls_level),
        "english": get_eng(cls_level)
    }

# Write to file
file_content = "quiz_data = " + json.dumps(quiz_data, indent=4) + "\n"
with open("c:/Users/Hardik/OneDrive/Desktop/shikshasetu/shikshaSetu/services/quiz_data.py", "w", encoding="utf-8") as f:
    f.write(file_content)

print(f"Generated {sum(len(sub) for c in quiz_data.values() for sub in c.values())} questions across 10 classes.")
