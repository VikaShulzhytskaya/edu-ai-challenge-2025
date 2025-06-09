Issue 1: Missing Second Plugboard Transformation
In the encryptChar method, the character goes through the plugboard at the beginning but missing the second plugboard transformation at the end. In a real Enigma machine, the signal goes:
Plugboard → Rotors → Reflector → Rotors (reverse) → Plugboard again

  encryptChar(c) {
    if (!alphabet.includes(c)) return c;
    this.stepRotors();
    c = plugboardSwap(c, this.plugboardPairs);
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      c = this.rotors[i].forward(c);
    }

    c = REFLECTOR[alphabet.indexOf(c)];

    for (let i = 0; i < this.rotors.length; i++) {
      c = this.rotors[i].backward(c);
    }

    return c;
  }

->

  encryptChar(c) {
    if (!alphabet.includes(c)) return c;
    this.stepRotors();
    c = plugboardSwap(c, this.plugboardPairs);
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      c = this.rotors[i].forward(c);
    }

    c = REFLECTOR[alphabet.indexOf(c)];

    for (let i = 0; i < this.rotors.length; i++) {
      c = this.rotors[i].backward(c);
    }

    c = plugboardSwap(c, this.plugboardPairs);
    return c;
  }


Issue 2: Incorrect Double-Stepping Logic
The rotor stepping mechanism has a bug in the double-stepping logic. Your current code:
The problem is when the middle rotor is at its notch position, it should step itself as well as cause the left rotor to step. But your code only steps the middle rotor if the right rotor is at its notch.
  stepRotors() {
    if (this.rotors[2].atNotch()) this.rotors[1].step();
    if (this.rotors[1].atNotch()) this.rotors[0].step();
    this.rotors[2].step();
  }

->

  stepRotors() {
    // Double-stepping: if middle rotor is at notch, it steps along with left rotor
    const middleAtNotch = this.rotors[1].atNotch();
    const rightAtNotch = this.rotors[2].atNotch();
    
    if (rightAtNotch || middleAtNotch) {
      this.rotors[1].step();
    }
    if (middleAtNotch) {
      this.rotors[0].step();
    }
    this.rotors[2].step();
  }

  Fixed Issues:
Added Missing Second Plugboard Transformation: The character now goes through the plugboard twice - once at the beginning and once at the end of the encryption process, which is how the real Enigma machine works.
Corrected Double-Stepping Logic: Fixed the rotor stepping mechanism to properly handle the double-stepping anomaly where:
The rightmost rotor always steps
If the middle rotor is at its notch, both the middle and left rotors step
If the rightmost rotor is at its notch, the middle rotor steps
Summary of Changes:
Line 49-53: Rewrote the stepRotors() method with proper double-stepping logic
Line 68: Added the missing second plugboard transformation: c = plugboardSwap(c, this.plugboardPairs);
Your Enigma machine should now work correctly! The encryption will be symmetric (encrypting the same message twice will return the original), and the rotor stepping will behave like the historical Enigma machine.