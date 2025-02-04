with open('apth/to/your/obj/file', 'r') as f:
    obj = []
    for line in f:
        obj.append(line)

vertecies = []
indecies = []

for i in range(len(obj)):
    if obj[i][0] == "v":
        tempVertecies = obj[i][2:].replace("\n", "").split()
        for j in range(len(tempVertecies)):
            tempVertecies[j] = float(tempVertecies[j])
        vertecies.append(tempVertecies)
    else:
        tempIndecies = obj[i][2:].replace("\n", "").split()
        for j in range(len(tempIndecies)):
            tempIndecies[j] = int(tempIndecies[j][0:tempIndecies[j].find("//")])
        indecies.append(tempIndecies)

mesh = []

print("V", vertecies, "\n")
print("I", indecies, "\n")

for i in range(len(indecies)):
    mesh.append([])
    for j in range(len(indecies[i])):
        mesh[len(mesh)-1].append(vertecies[indecies[i][j]-1])
    mesh[len(mesh)-1].append("#ff0000")

print("M", mesh)

output = open("path/to/your/output/file", "a")

output.write(str(mesh).replace("'], ", "'], \n"))
