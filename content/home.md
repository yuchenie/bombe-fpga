### Our ECE5760 Final Project

The Bombe machine was crucial to decoding the secrets of Nazi Germany. Our project uncovers the algorithms this machine exploited and automates the supporting work performed by others at Bletchley Park, as well as the operators of the Bombe machines themselves. 

The result is an integrated system that receives a user-fed crib and full-length text encrypted with the Enigma machine, and outputs the Enigma machine's initial conditions to decrypt the message. The FPGA program accelerates the brute-force aspects of the decryption process, and the HPS program executes top-level control of the machine. The user interface highlights the machine's sequential progress and displays the algorithm's final results.

The hardware acceleration performed by the FPGA, in combination with the automation of surrounding Bletchley Park operations, ultimately comprises a program that reduces the decryption time from hours to minutes. More importantly, the secrets encrypted by the Enigma machine are no longer consequential to the outcome of war; yet, this project uncovers the sparsely documented processes—both automated and manually performed—that changed the world.
