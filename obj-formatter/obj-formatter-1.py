with open('VideoShip.obj', 'r') as f:
   obj = []
   for line in f:
      obj.append(line)

output = open("output.txt", "a")

firstFace = True

for i in range(len(obj)):
   if obj[i][0] == "f" or obj[i][0] == "v" and obj[i][1] not in ["n", "t"]:
      if obj[i][0] == "v":
         if obj[i+1] != "v":
            output.write(obj[i][2:].replace(" ", ", ").replace("\n", ""))
         else:
            output.write(obj[i][2:].replace(" ", ", ").replace("\n", ", "))
      else:
         if firstFace:
            output.write("\n")
            firstFace = False
         f = 0
         while obj[i][f] != "/":
            f += 1
         output.write(obj[i][2:f]+", ")
         while obj[i][f] != " ":
            f += 1
         output.write(obj[i][f+1]+", ")
         f += 1
         while obj[i][f] != " ":
            f += 1
         if i == len(obj)-1:
            output.write(obj[i][f+1])
         else:
            output.write(obj[i][f+1]+", ")
