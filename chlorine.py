# copyright alex oliver 2024
# enquiries: https://xelaoliver.github.io

import pygame
import math

screen = {"x": 535, "y": 300, "fps": 60}
camera = {"x": 0, "y": 0, "z": 10, "rotx": 0, "roty": 0, "speed": .75, "fov": 90}
camera["focallength"] = screen["x"]/2/math.tan(math.radians(camera["fov"])/2)
allcoordinates = []
alldistances = []
vertdistances = []
nearclippingplane = 0.001
clock = pygame.time.Clock()

mouse_sensitivity = 0.003

pygame.init()
window = pygame.display.set_mode((screen["x"], screen["y"]))
pygame.display.set_caption("C₁₀H₁₅N - alex oliver | press Esc to release mouse")

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

    y1 = math.sin(camera["roty"])*store["z1"] + math.cos(camera["roty"])*store["y1"]
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
    while True:
        if vertdistance in alldistances:
            vertdistance += 0.0001
        else:
            break
    alldistances.append(vertdistance)
    allcoordinates.append(vertdistance)
    allcoordinates.append(colour)

def findxyintercept(x1, y1, z1, x2, y2, z2, line):
    t = (line-z1)/(z2-z1)
    return {"x1": x1+t*(x2-x1), "y1": y1+t*(y2-y1), "z1": line}

def zerodivision(a, b):
    return a/b if b else 0

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

            allcoordinates.append(math.floor(zerodivision(store[j]*(camera["focallength"]), store[2+j]))+screen["x"]/2)
            allcoordinates.append(math.floor(zerodivision(store[1+j]*(camera["focallength"]), store[2+j]))+screen["y"]/2)
        allcoordinates.append(store[i+9])
        allcoordinates.append(store[i+10])

def draw():
    window.fill(0)
    alldistances.sort(reverse = True)
    for n in range(len(alldistances)):
        i = allcoordinates.index(alldistances[n])-6
        pygame.draw.polygon(window, allcoordinates[i+7], [(allcoordinates[i], allcoordinates[i+1]), (allcoordinates[i+2], allcoordinates[i+3]), (allcoordinates[i+4], allcoordinates[i+5])])

running = True

mouse_locked = True
pygame.event.set_grab(True)
pygame.mouse.set_visible(False)

while running:
    keys = pygame.key.get_pressed()

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                if mouse_locked:
                    pygame.event.set_grab(False)
                    pygame.mouse.set_visible(True)
                    mouse_locked = False
                else:
                    pygame.event.set_grab(True)
                    pygame.mouse.set_visible(False)
                    mouse_locked = True

        if event.type == pygame.MOUSEBUTTONDOWN and not mouse_locked:
            pygame.event.set_grab(True)
            pygame.mouse.set_visible(False)
            mouse_locked = True

    if mouse_locked:
        mouse_movement = pygame.mouse.get_rel()
        camera["rotx"] += mouse_movement[0]*mouse_sensitivity
        camera["roty"] -= mouse_movement[1]*mouse_sensitivity

        # camera["roty"] = max(min(camera["roty"], math.pi / 2), -math.pi / 2)

    if keys[pygame.K_w]:
        camera["x"] += camera["speed"] * math.sin(camera["rotx"])
        camera["z"] -= camera["speed"] * math.cos(camera["rotx"])
    if keys[pygame.K_s]:
        camera["x"] -= camera["speed"] * math.sin(camera["rotx"])
        camera["z"] += camera["speed"] * math.cos(camera["rotx"])
    if keys[pygame.K_a]:
        camera["x"] -= camera["speed"] * math.cos(camera["rotx"])
        camera["z"] -= camera["speed"] * math.sin(camera["rotx"])
    if keys[pygame.K_d]:
        camera["x"] += camera["speed"] * math.cos(camera["rotx"])
        camera["z"] += camera["speed"] * math.sin(camera["rotx"])
    if keys[pygame.K_SPACE]: camera["y"] += camera["speed"]
    if keys[pygame.K_LSHIFT]: camera["y"] -= camera["speed"]

    alldistances = []
    allcoordinates = []
    triangle(-1, 0, -1, -1, 0, 1, 1, 0, 1, (255, 0, 0)) # bottom
    triangle(-1, 0, -1, 1, 0, -1, 1, 0, 1, (255, 0, 0))
    triangle(-1, 0, -1, -1, 0, 1, 0, 2, 0, (0, 255, 0)) # left
    triangle(1, 0, -1, 1, 0, 1, 0, 2, 0, (0, 0, 255)) # right
    triangle(-1, 0, 1, 1, 0, 1, 0, 2, 0, (255, 255, 0)) # front
    triangle(-1, 0, -1, 1, 0, -1, 0, 2, 0, (0, 255, 255)) # back
    translate()
    draw()

    pygame.display.flip()
    clock.tick(screen["fps"])
