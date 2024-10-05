import pygame 
import math

screen = {"x": 535, "y": 300, "fps": 60}
camera = {"x": 0, "y": 0, "z": 0, "rotx": 0, "roty": 0, "speed": 2, "fov": 90}
camera["focallength"] = screen["x"]/2/math.tan(math.radians(camera["fov"])/2)
allcoordinates = []
alldistances = []
vertdistances = []
nearclippingplane = 0.001

fps = pygame.time.Clock()

pygame.init() 
window = pygame.display.set_mode((screen["x"], screen["y"])) 
pygame.display.set_caption("chlorine")

def vert(x1, y1, z1):
    vertdistances.append(math.sqrt(math.pow(x1-camera["x"], 2) + math.pow(y1-camera["y"], 2) + math.pow(z1-camera["z"], 2)))
    x1 = x1
    y1 = y1
    z1 = z1
    x1 -= camera["x"]
    y1 -= camera["y"]
    z1 -= camera["z"]

    store = {"x1": x1, "y1": y1, "z1": z1}

    x1 = math.sin(camera["rotx"])*z1 + math.cos(camera["rotx"])*store["x1"]
    store["z1"] = math.cos(camera["rotx"])*store["z1"] - math.sin(camera["rotx"])*store["x1"]

    y1 = math.sin(camera["roty"])*z1 + math.cos(camera["roty"])*store["y1"]
    z1 = math.cos(camera["roty"])*store["z1"] - math.sin(camera["roty"])*store["y1"]

    x1 = -x1

    allcoordinates.append(x1)
    allcoordinates.append(y1)
    allcoordinates.append(z1)

def triangle(x1, y1, z1, x2, y2, z2, x3, y3, z3, colour):
    vertdistances.clear()
    vert(x1, y1, z1)
    vert(x2, y2, z2)
    vert(x3, y3, z3)
    vertdistance = (vertdistances[0]+vertdistances[1]+vertdistances[2])/3
    alldistances.append(vertdistance)
    allcoordinates.append(vertdistance)
    allcoordinates.append(colour)

def findxyintercept(x1, y1, z1, x2, y2, z2, line):
    t = (line-z1)/(z2-z1)
    return {"x1": x1+t*(x2-x1), "y1": y1+t*(y2-y1), "z1": line}

def translate():
    global allcoordinates
    store = allcoordinates
    allcoordinates = []

    justcoordinates = []
    for idx, val in enumerate(store):
        if idx != 0 and (idx % 9 == 0 or idx % 10 == 0):
            continue
        justcoordinates.append(val)

    for i in range(int(len(store)/11)):
        i = i*11

        for d in range(3):
            j = d*3
            j += i

            """
            x1 = justcoordinates[j]
            y1 = justcoordinates[j+1]
            z1 = justcoordinates[j+2]
            x2 = justcoordinates[(j+3) % len(justcoordinates)]
            y2 = justcoordinates[(j+4) % len(justcoordinates)]
            z2 = justcoordinates[(j+5) % len(justcoordinates)]
            
            if not(z1 >= nearclippingplane and z2 >= nearclippingplane or z1 < nearclippingplane and z2 < nearclippingplane):
                intercepts = findxyintercept(x1, y1, z1, x2, y2, z2, nearclippingplane)
                if z1 >= nearclippingplane:
                    store[(j+3) % len(store)] = intercepts["x1"]
                    store[(j+4) % len(store)] = intercepts["y1"]
                    store[(j+5) % len(store)] = intercepts["z1"]
                else:
                    store[j] = intercepts["x1"]
                    store[j+1] = intercepts["y1"]
                    store[j+2] = intercepts["z1"]
            """

            allcoordinates.append(math.floor(store[j]*(camera["focallength"]/store[2+j]))+screen["x"]/2)
            allcoordinates.append(math.floor(store[1+j]*(camera["focallength"]/store[2+j]))+screen["y"]/2)
        allcoordinates.append(store[i+9])
        allcoordinates.append(store[i+10])

def draw():
    alldistances.sort(reverse = True)
    for n in range(len(alldistances)):
        i = allcoordinates.index(alldistances[n])-6
        pygame.draw.polygon(window, allcoordinates[i+7], [(allcoordinates[i], allcoordinates[i+1]), (allcoordinates[i+2], allcoordinates[i+3]), (allcoordinates[i+4], allcoordinates[i+5])])

running = True

while running: 
    for event in pygame.event.get(): 
        if event.type == pygame.QUIT: 
            running = False

    window.fill(0)
    alldistances = []
    allcoordinates = []
    triangle(-1, 0, -5, -1, 2, -5, 1, 2, -5, (255, 0, 0))
    triangle(-1, 0, -5, 1, 0, -5, 1, 2, -5, (0, 255, 0))
    translate()
    draw()

    pygame.display.flip()
    fps.tick(screen["fps"])
