# this only worked with .obj files that their faces were only triangles (idk how other faces would work)

with open('example.obj', 'r') as f:
   obj = []
   for line in f:
      obj.append(line)

output = open("output.txt", "a")

for i in range(len(obj)):
   if obj[i][0] == "#":
      i+=1
   elif obj[i][0] == "v" and obj[i][1] != "n" and obj[i][1] != "t" or obj[i][0] == "f":
      output.write(obj[i][1:len(obj[i])].replace(" ",","))
