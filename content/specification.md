Aside from the overall algorithm design of the project, there are several other parameters to consider that would modify the system architecture. Some of these parameters were derived from the true process reported from Bletchley Park; other parameters are adapted to create a system more generalizable to any decoded message, rather than an anticipated message from the standardized Nazi communications. 

### Rotors, Reflectors, and their Notches

The search space that the mathematicians at Bletchley Park faced could be described:

1. There were five unique rotors, three of which were selected in any order to populate the machine. The selection of three out of five produces a number of combinations: 

$$\frac{5!}{(5-3)!} = 60$$ 

2. Each of the 3 rotors could initially be set to any letter, producing $26^3 = 17,576$ combinations.


3. The rotor stepping mechanism depends on the notches on the right and middle rotors. The notch could be set to any of the 26 letters of the alphabet, producing $26^2 = 676$ combinations.


4. There were two unique reflectors, one of which was selected to populate the machine. The reflector did not increment, so there was no initial position setting. This produced 2 combinations.


5. Up to 10 plugboard cables were used. The amount of different combinations this created is a function of 1) the number of plugboard cables $P$, 2) the number of unique letter groupings out of the 26 letters $G$, and 3) the number of ways to interconnect the groups of letters $I$. For $P = 10$ plugboard cables:

$$G = \frac{26!}{(2P)! \cdot (26-2P)!} = 230,230$$

$$I = (2P - 1) \cdot (2P - 3) \cdot (2P - 5) \cdot \ldots \cdot 1 = 654,729,075$$

The number of total possible settings is the product $G \cdot I = 150,738,274,937,250$ combinations.

The product of these factors is  $2.149 \times 10^{23}$ — representing the number of possible initial configurations from which the Bletchley Park mathematicians had to determine the one true initial parameter. However, some of these factors are omitted in our own project’s search space. 

Firstly, the five unique rotors and two unique reflectors are not considered because this simply became a top-level parallelization problem for the mathematicians: Many Bombe machines were operated in parallel to narrow this search space, and we felt that it did not need to be reflected in our own acceleration process beyond the architecture to easily swap out rotors and reflectors in the Verilog program, because it could be simply replicated with more FPGAs. 

Therefore, because our program is not designed to compute which three rotors chosen from the five preset rotors populate the Enigma machine, we use Rotor I for every rotor in the system. The output of a single rotor is determined by the input and the offset index, each of which is a value in the range [0, 25]. The operation applied by rotor one can be summarized with the permutation vector below, where j corresponds to the input letter and p corresponds to the offset index:

$$\sigma_p(j) = (\sigma_0[(j + p) \bmod 26] - p) \bmod 26$$

$$\sigma_0 = (4, 10, 12, 5, 11, 6, 3, 16, 21, 25, 13, 19, 14, 22, 24, 7, 23, 20, 18, 15, 0, 8, 1, 17, 2, 9)$$

Therefore, the forward operation can be placed into a lookup table with $26^2$ elements. Similarly, the reverse operation is placed into another lookup table with $26^2$ elements. Because the reflector has a static permutation vector, it is placed into a lookup table with 26 elements.

Secondly, the notch positions were often deduced by observing patterns between different encryption initial conditions, because the operators chose predictable settings. Because this pattern could be exploited to determine the notch position, the Bletchley Park algorithm did not evaluate these configurations, and neither does our own algorithm. With these reductions, our project’s search space becomes the product of combinations produced by the rotor initial conditions and plugboard settings: $2.649 \times 10^{18}$ combinations.

Therefore, because the notch is not deduced, we choose the notch position of each rotor to be the Rotor I notch at zero ring offset: the letter N, which is represented as the number 16.

### Any message, any crib

We chose to design our program to accommodate any length of cribs and loops, within a reasonable range.

The length of the crib is critical in the decryption process. At Bletchley Park, significant effort was made to develop optimal cribs. Particularly, a longer crib had a greater likelihood of containing a longer loop in each crib-cipher pair (see discussion on crib length below). This would ultimately decrease the number of false stops and, consequently, decrease the computation time. In order to develop particularly long cribs, military attacks would be engineered to force certain Nazi bases to communicate the location and nature of the attack in a predictable syntax. A simpler way to engineer a crib would have been to predict the syntax of the date and introductory weather forecast. 

However, in order for our design to be hyper-adaptable to the decryption of any sort of message, we could not include a preset of cribs. We wanted our system to be able to accommodate any message with any length crib. 

We designed our system around a maximum crib length of 64 characters, which we deduced is reasonable for how much plaintext might be known of an encrypted message. For reference, the average English word is 4.7 characters, so this would allow for cribs that contained 13.7 words on average. In order to generalize the FPGA to receive a variable length, we set up a PIO channel that can send up to 64 characters (with each character represented in 5 bits, for letters 0-25), and have another PIO channel through which the length of the crib is communicated. Other system architecture choices towards this are detailed in the Bombe machine section.

The length of the loop is also a key aspect of the computation time. Recall that the length of the loop defines the number of letter pairs that are checked by the Bombe machine. With fewer letters, there are more possible combinations of initial conditions that can produce that sequence of letter pairs; on the other hand, a longer crib would have conditions that will produce fewer false stops. In order to reduce the duration of computation—which increases as the number of false stops increases—we always choose to supply the Bombe machine with the longest loop. 
