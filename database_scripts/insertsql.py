import json

with open("res/stars.json") as starjsonfile:
  stars = json.load(starjsonfile)

with open("res/links.json") as linksjsonfile:
  links = json.load(linksjsonfile)

with open("res/planets_new.json") as planetsjsonfile:
  planets = json.load(planetsjsonfile)


with open("dump.sql", "w") as sqlfile:
  count = 0
  sqlfile.write("insert into celestial_bodies (name, type) values\n")
  for _, v in stars.items():
    if count != 0 :
      sqlfile.write(",\n")
    sqlfile.write("(\"{}\", \"star\")".format(v["proper"]))
    count += 1
  for _, v in links.items():
    sqlfile.write(",\n")
    sqlfile.write("(\"{}\", \"constellation\")".format(v["name"]))

  for k, v in planets.items():
    sqlfile.write(",\n")
    sqlfile.write("(\"{}\", \"planet\")".format(k))
    if "moons" in v.keys():
      for moon in v["moons"] :
        sqlfile.write(",\n")
        sqlfile.write("(\"{}\", \"moon\")".format(moon))
  sqlfile.write(";\n\n")



