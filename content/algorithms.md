### The Enigma Machine

The Enigma machine was an electromechanical encryption device used by Nazi Germany. The device was reconfigurable to produce 1.07 • 1023 different initial positions, making a brute-force decryption infeasible—certainly without modern technology, and even today, infeasible to execute on a single FPGA. 

The machine operated by scrambling letters through a series of swaps. The scrambling circuit would be incremented each time a letter was passed through the machine. Each swap in the sequence had a periodicity of 26 (for each letter of the alphabet), but the manner in which the swapping mechanisms were incremented resulted in an overall scrambling mechanism that had a periodicity of 16,900 letters—far longer than any message sent by an Enigma machine before the machine was reset with different initial conditions. The resulting effect was random letter swapping that was impossible to decode algorithmically. 

The electromechanical architecture of the device can be explored at [this website](https://enigma.virtualcolossus.co.uk/VirtualEnigma/). The physical mechanism is abstracted away in the description of the algorithm.

<div align="center" style="margin: 50px 0;">
<img src="content/images/enigma_block_diagram.drawio.png" width="800" alt="alt text">
</div>

A letter entered into the machine is passed through a series of swaps. Each operation, represented by a single shape, represents the bidirectional operation of switching the input letter with another letter. Each rotor scrambles the 26 input positions into 26 output positions. For a single rotor position, for example, A → K, E → R, R → B, and so on. The reflector also scrambles letters, but a crucial difference is that it scrambles in pairs. That means instead of E → R and R → B as in the rotor case, E ↔ R instead for the reflector. This is extremely important because with the reflector, no letter can map to itself. No matter what the rotor or plugboard configuration, an input letter will never equal the output letter. There were five unique rotors and two unique reflectors in the Enigma M3. The plugboard is a customizable letter swap. An operator would place a wire between two “letters” on a board in order to swap the letters, or leave the letter unwired for the operation to map the letter to itself.

A circle was chosen to represent the rotors because the enigma machine will increment, i.e. rotate, the rotor one position every time a key is pressed. The plugboard and reflector are squares because their configurations do not change when a key is pressed. Each rotor has 26 unique positions that they can increment through.

The rotors were incremented as letters were passed in. Each of the five unique rotors had a “notch” letter associated with it, which dictated its increment behavior. The first (right) rotor through which the letter passes would increment its swaps by one letter for each key press (that is, if it swaps A ↔ F on the first key press, it would swap B ↔ G on the second pass). The second (middle) rotor would increment each time the first rotor reached its notch letter—once if it was not at its own notch letter, or twice when it had reached its own notch letter. The third (left) rotor would increment each time the second rotor reaches its notch letter.

Essentially, the Enigma Machine swaps letters with each other, and the swaps change with every key press. The way the swaps evolve is complex, but deterministic, according to the rotor position and rotor notch location.

### The Bombe Machine

Each rotor can be generalized to two operation tables: the forward and reverse operations. The division of each rotor into two operations was emulated by the Bombe machine, which had two Bombe circuits in place of each single Enigma circuit for each rotor. The Bombe machine had separate circuits for the forward and reverse pass just so that the forward circuitry would be separated from the reverse circuitry. The plugboard was excluded from the Bombe machine; plugboard settings were deduced in a separate step in the decryption process.

<div align="center" style="margin: 50px 0;">
<img src="content/images/bombe_block_diagram.drawio.png" width="600" alt="alt text">
</div>

If we represent each letter as a zero-indexed number such that A = 0, B = 1, and so on, the operations can be represented as numerical functions. At an offset index of zero, the first of the preset rotors, Rotor I, is associated with the permutation vector:

$$\sigma_0 = (4, 10, 12, 5, 11, 6, 3, 16, 21, 25, 13, 19, 14, 22, 24, 7, 23, 20, 18, 15, 0, 8, 1, 17, 2, 9)$$

Then, the forward operation can be represented as a $26 \times 26$ permutation matrix $M$ where $M[\sigma[j]][j] = 1$ for each column $j$.

$$M_{ij} = \begin{cases} 1 & \text{if input } j \text{ maps to output } i \\ 0 & \text{otherwise} \end{cases}$$

The one-hot output vector $y$ can be expressed in terms of an input one-hot column vector $x$:

$$y = Mx$$

The inverse operation is expressed with the transpose of $M$:

$$y = M^T x$$

These operations are changed as the rotor is stepped, such that the permutation vector is modified:

$$\sigma_p(j) = (\sigma_0[(j + p) \bmod 26] - p) \bmod 26$$

For example, the permutation vector at one step from the index-zero permutation vector is represented:

$$\sigma_1 = (9,\ 11,\ 4,\ 10,\ 5,\ 2,\ 15,\ 20,\ 24,\ 12,\ 18,\ 13,\ 21,\ 23,\ 6,\ 22,\ 19,\ 17,\ 14,\ 25,\ 7,\ 0,\ 16,\ 1,\ 8,\ 3)$$

The reflector is static, so its permutation vector is constant at every step. For the first of the preset reflectors, Reflector UKW-B, the permutation vector is:

$$\sigma = (24,\ 17,\ 20,\ 7,\ 16,\ 18,\ 11,\ 3,\ 15,\ 23,\ 13,\ 6,\ 14,\ 10,\ 12,\ 8,\ 4,\ 1,\ 5,\ 25,\ 2,\ 22,\ 21,\ 9,\ 0,\ 19)$$

The plugboard can be similarly represented as a static operation, except it is distinct from the reflector in two ways:
The plugboard is customizable, and will become one of the aspects of the Enigma machine that is decoded in the decryption process. Therefore, no assumptions are made about the plugboard operation.
The plugboard can have letters that map to themselves.

The significance of the series of operations is that the input into the set of operations is never the same as the output. Because the reflector is fixed-point free, and the remaining functions have their inverses applied, the entire transformation is fixed-point free.

This is the first aspect of the Enigma machine that the Bletchley Park mathematicians cracked. With knowledge of a segment of text that must be encoded in the encrypted message, the position at which the known segment of text appears can be narrowed down to only text windows for which there are no overlapping letters. For example, consider the following text window and known segment of text (“crib”):

Encrypted message: 
`zcnzw kbdwn krruz dlqnq kvmrg nasob tzqlh ycnwr dwpvf tqtnq tjboj aakgi fkgpq tacmk sflyq xusdt xesjq azuow dgdju ibrgb ypkjp snpgl fqhap abiuk vbgic jskne qcgsf cagfu gyrij bgsey mabol iltbn djlak yppeq yeahr qcyzc gttlg eaprd ifzlm nxhkk wwxeq ezglw qnpzy zvvzh xriuk oykdo dkmzk veauj ghijt szozu hxkji nyyzb ajdeu sjnrq ebmcd qajuc ntczv`

Known text (“crib”):
`illseemanyofyouinlabthisafternoon`

We can discern that the piece of text at offset index 1 cannot be an encryption of the crib, because of the letter overlaps:

`illseema [n] yofyouinlabthisafternoon`

`cnzwkbdw [n] krruzdlqnqkvmrgnasobtzql`

However, the piece of text at offset index 0 can plausibly match with the crib, because it has no letter overlaps.

`illseemanyofyouinlabthisafternoon`

`zcnzwkbdwnkrruzdlqnqkvmrgnasobtzq`

The second aspect of the Enigma machine that was exploited was the relationship between transformations. Although the transformation was changed between every letter, the alteration could be reduced to two changes:
The stepping mechanism was such that the right rotor was incremented at every letter; the middle rotor was incremented once when only the right rotor was at its notch, or twice when both the right and middle rotors were at their notches; and the left rotor was incremented when the middle rotor reached its notch. 
The permutation vector for each rotor at increment p could be written:

$$\sigma_p(j) = (\sigma[(j + p) \bmod 26] - p) \bmod 26$$

Therefore, given an initial condition that defines the transformation at an initial letter, the transformation at a known offset from the initial letter can be inferred. 

The Bombe machine utilized this feature to determine a subset of valid initial conditions. The Bombe machine computation was preceded by a manual search for “loops” within the cipher-crib pair. A loop is the sequence of indices corresponding to letter transformations that could be chained together such that the input to the series of transformations is equal to the output. Consider this loop example:

`illseemanyo [f] youinlabthisa [f] ternoon`

`xfdqjfnngfy [g] xlsnscundcopm [g] pwhwffo`

For a hypothetical initial rotor position at the first index, the transformations—or, as it was called at Bletchley Park, the “equivalent circuits”—at positions 11 and 25 can be derived. The core functionality of the Bombe machine was the derivation of the equivalent circuits for each hypothetical initial rotor position. After the derivation, the Bombe machine was wired such that the equivalent circuits would form a chain:

<div align="center" style="margin: 50px 0;">
<img src="content/images/fg_loop.drawio.png" width="600" alt="alt text">
</div>

Notice that for the true initial condition, if the input letter is `f`, then the intermediate letter will be `g` and the output letter will be `f`. Therefore, we can rule out any initial position for which this circuit does not produce any outputs equal to its input. This typically reduces the initial position hypotheses from 17,576 to a few thousand.

This example draws on a 2-node loop, but the loops can be of any length. Consider, for example, the same cipher-crib pair but with a slightly longer loop:

`illseemanyofyou [i] nlabth [i] safternoo [n]`

`xfdqjfnngfygxls [n] scundc [o] pmgpwhwff [o]`

<div align="center" style="margin: 50px 0;">
<img src="content/images/ino_loop.drawio.png" width="800" alt="alt text">
</div>

Although it was ambiguous in the two-letter case, notice that this configuration requires a specific order through which the letters are transformed through the equivalent circuits. This corresponds to the order in which the letters must be transformed in order to attain the loop. 

Furthermore, which of the 26 letters will produce a valid input-output pair is indeterministic for an encryption scheme that includes a plugboard. Recall that the Bombe machine excludes the plugboard transformation—therefore, if the letter in the crib at the index of the first equivalent circuit is transformed by the plugboard, the transformation is not represented by the Bombe rotors. In that scenario, the input letter that would produce a valid input-output pair is not the letter at that index in the crib, but rather the output of the plugboard when the letter at that index in the crib is input. Therefore, every letter must be checked when validating the Bombe circuit. 

Notice that because of the absence of the plugboard, the only way to use the equivalent circuits without asserting a plugboard hypothesis is to perform the analysis on a loop. Although it comes with the added complexity of determining a valid loop, the separation of the plugboard deduction from the initial position validation greatly streamlines the algorithm.

It is also important to note that not every cipher-crib pair produces a loop. In fact, the crib demonstrated above (“illseemanyofyouinlabthisafternoon”) only produces a loop for [insert percentage] of all possible initial conditions. The development of an effective crib that guarantees a loop became an essential aspect of the Bletchley Park operations—in fact, the military would launch specific attacks for the purpose of using the locations of the attacks as cribs, because it was guaranteed that the Nazi bases would report the location. (Because we cannot do this, we simply make an algorithm to brute-force different cribs until a match is found).

### The Plugboard Detector

At this point, we have a crib, a cipher, the loop that consists of letter-pairs and their positions, and the loop that was formed by the rotor hypothesis in the Bombe Machine. For a single crib-cipher pair, the Bombe machine can quite easily have over a thousand false stops, meaning there are a thousand rotor hypotheses that make valid loops. The number of false stops decreases with the size of the loop. This means that the Plugboard Detector not only deduces the plugboard configuration, but it also rejects a very large number of guesses.

It is worthwhile to reframe a few things at this point. Firstly, we need to think about the structure of the whole system.

The Bombe Machine itself looks like the following image. Each equivalent circuit represents its own Enigma Machine with the rotor hypothesis $[r_{\text{left}}, r_{\text{mid}}, r_{\text{right}}] + \text{increment}$. The offsets are determined by the location in the crib/cipher of the letters in the loop. We’ll cover this more in detail in a second.

<div align="center" style="margin: 50px 0;">
<img src="content/images/internal_circuit.drawio.png" width="800" alt="alt text">
</div>

The Bombe Machine will stop and pass the information onto the Plugboard Detector if, for some rotor hypothesis, `input letter == output letter`. In our crib/cipher, the loop consists of the letters `o`, `i`, and `n`, but these loop letters will not be the same as the input and intermediate letters due to the plugboard. The Enigma Machine used ten plugboard pairs, meaning 20/26 letters were swapped. This means only 6/26 or 23% of the letters would be unswapped.

`illseemanyofyou [i] nlabth [i] safternoo [n]`

`xfdqjfnngfygxls [n] scundc [o] pmgpwhwff [o]`

The following is an undirected graph of the letter pairs in the crib and cipher. You can see the nodes `o`, `i`, and `n` connected by edges 22, 15, and 32. 

<div align="center" style="margin: 50px 0;">
<img src="content/images/menuGraph.png" width="800" alt="alt text">
</div>

Since the first equivalent circuit increment is 22 and the second equivalent circuit increment is 15, the input letter, whatever it is, corresponds to `o`, intermediate letter 1 corresponds to `i`, and intermediate letter 2 corresponds to `n`. Let’s say, for this example, input letter, intermediate letter 1, and intermediate letter 2 are `x`, `y`, and `z`.

For our own convenience, let us name two spaces: “crib/cipher space” and “circuit space”. Recall the previous diagram of the Enigma Machine:

<div align="center" style="margin: 50px 0;">
<img src="content/images/spaces.drawio.png" width="700" alt="alt text">
</div>

After passing through the plugboard, the letters exist in “circuit space”. Input letter `x`, intermediate letter 1 `y`, and intermediate letter 2 `z` exist in this space, and the crib/cipher letters `o`, `i`, and `n` exist in crib/cipher space. 

<div align="center" style="margin: 50px 0;">
<img src="content/images/PlugboardAndCircuit.drawio.png" width="600" alt="alt text">
</div>

By framing our circuit as two spaces, it becomes clear that the plugboard maps `o` → `x`, `i` → `y`, and `n` → `z`. In addition, since the plugboard is a letter swap, `x` → `o`, `i` → `y`, and `n` → `z`. So, the letters from the crib/cipher loop and the letters from the Bombe machine loop give us three plugboard pairs as a “seed”. This starts our hypothesis. 

With this knowledge, let us look back at our crib/cipher pair. We have the plugboard mappings for six letters: `o`, `i`, `n`, `x`, `y`, and `z`. We’ll bold each of their instances.

<code><b>i</b>llseema<b>n</b>y<b>o</b>f<b>y</b>ou<b>i</b>nlabth<b>i</b>after<b>noon</b></code>

<code><b>x</b>fdqjf<b>nn</b>gf<b>y</b>g<b>x</b>ls<b>n</b>scu<b>n</b>dc<b>o</b>pmgpwhwff<b>o</b></code>

We know what the circuit space equivalent of each of these letters is. Take the 7th crib-cipher pair, `m` and `n`. We know that `n` ↔ `z`, so if we pass the letter `z` through the equivalent circuit set to $[r_{\text{left}}, r_{\text{mid}}, r_{\text{right}}] + 6$, we’ll find the circuit space equivalent to M:

<div align="center" style="margin: 50px 0;">
<img src="content/images/plugboardPropagation.drawio.png" width="800" alt="alt text">
</div>

This process of using the crib-cipher letter pairs to deduce more plugboard configurations is called `propagation`. Let’s try this step one more time, but instead, we’ll do it for the letters at position 1: `i` and `x`.

<code><b>i</b>llsee<b>m</b>a<b>n</b>y<b>o</b>f<b>yo</b>u<b>i</b>nlabth<b>i</b>safter<b>noon</b></code>

<code><b>x</b>fdqjf<b>nn</b>gf<b>y</b>g<b>x</b>ls<b>n</b>scu<b>n</b>dc<b>o</b>p<b>m</b>gpwhwff<b>o</b></code>

The special thing about this pair is that we already have a hypothesis for plugboard transformation for `i` and `x`: `i` ↔ `y` and `x` ↔ `o`. `i` and `x` are the crib/cipher space letters, and `y` and `o` are the circuit space letters. This means that the equivalent circuit, when set to $[r_{\text{left}}, r_{\text{mid}}, r_{\text{right}}] + 0$, must map `y` ↔ `o`. If, instead, it maps `y` to some letter that isn’t `o` and maps `o` to some letter that isn’t `y`, there will be a contradiction. This means that the rotor hypothesis, along with its matching loop letters, is incorrect.

<div align="center" style="margin: 50px 0;">
<img src="content/images/contradiction.drawio.png" width="800" alt="alt text">
</div>

The more plugboard pairs there are (13 is the max), the more constraints there are on the system, and the more false stops we can reject. The way to think about this algorithmically is 

<code>circuit[i][ plug[crib[i]] ] = plug[cipher[i]]</code>

Essentially, the plugboard takes the crib and cipher, and transforms those letters into circuit space. The circuit, for some rotor hypothesis and increment, links the circuit space representations of <code>crib[i]</code> and <code>cipher[i]</code>. So, if we know <code>plug[crib[i]]</code>, then we can use the equivalent circuit to find <code>plug[cipher[i]]</code>. Or alternatively, if <code>plug[cipher[i]]</code> is already known, we use the equivalent circuit to ensure that our constraints all remain consistent with each other. This becomes an extremely powerful relationship once you realize that knowing a single plugboard pair for two letters then allows you to propagate this constraint onto every instance of either of these two letters in the crib and cipher. 