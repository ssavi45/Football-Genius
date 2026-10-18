"""
Generator script for Journeyman Player Data Batch 2 (Players 121 to 210: 90 players).
Covers modern icons, active superstars, Champions League winners, and European legends.
"""
import sys
import os

sys.path.append(os.path.dirname(__file__))
from player_builder_helpers import player, stint

def generate():
    players = [
        # 121. Karim Benzema
        player(
            "karim_benzema", "Karim Benzema", "Karim Mostafa Benzema",
            ["Benzema", "KB9", "Karim Mostafa Benzema"],
            "1987-12-19", ["France", "Algeria"], "active",
            [
                stint(1, "lyon", "Lyon", "2004", "2009", appearances=148),
                stint(2, "rmcf", "Real Madrid", "2009", "2023", appearances=648),
                stint(3, "al_ittihad", "Al-Ittihad", "2023", None, appearances=30)
            ],
            provider_ids={"transfermarkt": "18922", "wikidata": "Q7097"},
            career_complete=False,
            exclusions=[{"club": "Lyon B", "reason": "b-team-only", "evidence": "Played in Championnat de France Amateur; senior first team debut was 15 Jan 2005 vs Metz."}]
        ),
        # 122. Harry Kane
        player(
            "harry_kane", "Harry Kane", "Harry Edward Kane",
            ["Kane", "Harry Edward Kane"],
            "1993-07-28", ["England"], "active",
            [
                stint(1, "tottenham", "Tottenham Hotspur", "2009", "2011", appearances=0),
                stint(2, "leyton_orient", "Leyton Orient", "2011", "2011", appearances=18, stint_type="loan"),
                stint(3, "millwall", "Millwall", "2012", "2012", appearances=27, stint_type="loan"),
                stint(4, "norwich", "Norwich City", "2012", "2013", appearances=5, stint_type="loan"),
                stint(5, "leicester", "Leicester City", "2013", "2013", appearances=15, stint_type="loan"),
                stint(6, "tottenham", "Tottenham Hotspur", "2013", "2023", appearances=435),
                stint(7, "bayern", "Bayern Munich", "2023", None, appearances=45)
            ],
            provider_ids={"transfermarkt": "132098", "wikidata": "Q297247"},
            career_complete=False
        ),
        # 123. Mohamed Salah
        player(
            "mohamed_salah", "Mohamed Salah", "Mohamed Salah Hamed Mahrous Ghaly",
            ["Salah", "Mo Salah", "The Egyptian King"],
            "1992-06-15", ["Egypt"], "active",
            [
                stint(1, "al_mokawloon", "Al Mokawloon Al Arab", "2010", "2012", appearances=44),
                stint(2, "basel", "Basel", "2012", "2014", appearances=79),
                stint(3, "cfc", "Chelsea", "2014", "2015", appearances=19),
                stint(4, "fiorentina", "Fiorentina", "2015", "2015", appearances=26, stint_type="loan"),
                stint(5, "roma", "Roma", "2015", "2017", appearances=83),
                stint(6, "lfc", "Liverpool", "2017", None, appearances=349)
            ],
            provider_ids={"transfermarkt": "148455", "wikidata": "Q139049"},
            career_complete=False
        ),
        # 124. Kevin De Bruyne
        player(
            "kevin_de_bruyne", "Kevin De Bruyne", "Kevin De Bruyne",
            ["De Bruyne", "KDB"],
            "1991-06-28", ["Belgium"], "active",
            [
                stint(1, "genk", "Genk", "2008", "2012", appearances=113),
                stint(2, "cfc", "Chelsea", "2012", "2012", appearances=0),
                stint(3, "werder_bremen", "Werder Bremen", "2012", "2013", appearances=34, stint_type="loan"),
                stint(4, "cfc", "Chelsea", "2013", "2014", appearances=9),
                stint(5, "vfl_wolfsburg", "VfL Wolfsburg", "2014", "2015", appearances=73),
                stint(6, "mancity", "Manchester City", "2015", None, appearances=382)
            ],
            provider_ids={"transfermarkt": "88755", "wikidata": "Q357984"},
            career_complete=False
        ),
        # 125. Luka Modrić
        player(
            "luka_modric", "Luka Modrić", "Luka Modrić",
            ["Modric", "Luka Modric"],
            "1985-09-09", ["Croatia"], "active",
            [
                stint(1, "dinamo_zagreb", "Dinamo Zagreb", "2003", "2003", appearances=0),
                stint(2, "zrinjski_mostar", "Zrinjski Mostar", "2003", "2004", appearances=25, stint_type="loan"),
                stint(3, "inter_zapresic", "Inter Zaprešić", "2004", "2005", appearances=18, stint_type="loan"),
                stint(4, "dinamo_zagreb", "Dinamo Zagreb", "2005", "2008", appearances=94),
                stint(5, "tottenham", "Tottenham Hotspur", "2008", "2012", appearances=160),
                stint(6, "rmcf", "Real Madrid", "2012", None, appearances=534)
            ],
            provider_ids={"transfermarkt": "27974", "wikidata": "Q483837"},
            career_complete=False
        ),
        # 126. Sergio Ramos
        player(
            "sergio_ramos", "Sergio Ramos", "Sergio Ramos García",
            ["Ramos", "Sergio Ramos García"],
            "1986-03-30", ["Spain"], "active",
            [
                stint(1, "sevilla", "Sevilla", "2003", "2005", appearances=45),
                stint(2, "rmcf", "Real Madrid", "2005", "2021", appearances=671),
                stint(3, "psg", "Paris Saint-Germain", "2021", "2023", appearances=58),
                stint(4, "sevilla", "Sevilla", "2023", "2024", appearances=37)
            ],
            provider_ids={"transfermarkt": "25557", "wikidata": "Q483309"},
            career_complete=False,
            exclusions=[{"club": "Sevilla Atlético", "reason": "b-team-only", "evidence": "Played 26 games in Segunda B before senior first team debut."}]
        ),
        # 127. Luis Suárez
        player(
            "luis_suarez", "Luis Suárez", "Luis Alberto Suárez Díaz",
            ["Suarez", "El Pistolero", "Luis Alberto Suarez Diaz"],
            "1987-01-24", ["Uruguay"], "active",
            [
                stint(1, "nacional", "Nacional", "2005", "2006", appearances=35),
                stint(2, "groningen", "Groningen", "2006", "2007", appearances=37),
                stint(3, "ajax", "Ajax", "2007", "2011", appearances=159),
                stint(4, "lfc", "Liverpool", "2011", "2014", appearances=133),
                stint(5, "fcb", "Barcelona", "2014", "2020", appearances=283),
                stint(6, "atletico", "Atlético Madrid", "2020", "2022", appearances=83),
                stint(7, "nacional", "Nacional", "2022", "2022", appearances=16),
                stint(8, "gremio", "Grêmio", "2023", "2023", appearances=54),
                stint(9, "inter_miami", "Inter Miami", "2024", None, appearances=30)
            ],
            provider_ids={"transfermarkt": "44352", "wikidata": "Q26517"},
            career_complete=False
        ),
        # 128. Edinson Cavani
        player(
            "edinson_cavani", "Edinson Cavani", "Edinson Roberto Cavani Gómez",
            ["Cavani", "El Matador", "Edinson Roberto Cavani Gomez"],
            "1987-02-14", ["Uruguay"], "active",
            [
                stint(1, "danubio", "Danubio", "2005", "2007", appearances=30),
                stint(2, "palermo", "Palermo", "2007", "2010", appearances=117),
                stint(3, "napoli", "Napoli", "2010", "2013", appearances=138),
                stint(4, "psg", "Paris Saint-Germain", "2013", "2020", appearances=301),
                stint(5, "manu", "Manchester United", "2020", "2022", appearances=59),
                stint(6, "valencia", "Valencia", "2022", "2023", appearances=28),
                stint(7, "boca_juniors", "Boca Juniors", "2023", None, appearances=41)
            ],
            provider_ids={"transfermarkt": "48280", "wikidata": "Q167475"},
            career_complete=False
        ),
        # 129. Pierre-Emerick Aubameyang
        player(
            "pierre_emerick_aubameyang", "Pierre-Emerick Aubameyang", "Pierre-Emerick Emiliano François Aubameyang",
            ["Aubameyang", "Auba"],
            "1989-06-18", ["Gabon", "France"], "active",
            [
                stint(1, "dijon", "Dijon", "2008", "2009", appearances=39, stint_type="loan"),
                stint(2, "lille", "Lille", "2009", "2010", appearances=24, stint_type="loan"),
                stint(3, "monaco", "Monaco", "2010", "2011", appearances=23, stint_type="loan"),
                stint(4, "saint_etienne", "Saint-Étienne", "2011", "2013", appearances=97),
                stint(5, "bvb", "Borussia Dortmund", "2013", "2018", appearances=213),
                stint(6, "afc", "Arsenal", "2018", "2022", appearances=163),
                stint(7, "fcb", "Barcelona", "2022", "2022", appearances=24),
                stint(8, "cfc", "Chelsea", "2022", "2023", appearances=21),
                stint(9, "marseille", "Marseille", "2023", "2024", appearances=51),
                stint(10, "al_qadsiah", "Al Qadsiah", "2024", None, appearances=10)
            ],
            provider_ids={"transfermarkt": "58864", "wikidata": "Q295240"},
            career_complete=False,
            exclusions=[{"club": "AC Milan", "reason": "no-senior-appearances", "evidence": "Signed professional youth contract with AC Milan but played 0 senior competitive first team matches; had 4 consecutive loan spells before permanent transfer."}]
        ),
        # 130. Romelu Lukaku
        player(
            "romelu_lukaku", "Romelu Lukaku", "Romelu Menama Lukaku Bolingoli",
            ["Lukaku", "Big Rom"],
            "1993-05-13", ["Belgium"], "active",
            [
                stint(1, "anderlecht", "Anderlecht", "2009", "2011", appearances=98),
                stint(2, "cfc", "Chelsea", "2011", "2012", appearances=12),
                stint(3, "west_brom", "West Bromwich Albion", "2012", "2013", appearances=38, stint_type="loan"),
                stint(4, "everton", "Everton", "2013", "2017", appearances=166),
                stint(5, "manu", "Manchester United", "2017", "2019", appearances=96),
                stint(6, "inter", "Inter Milan", "2019", "2021", appearances=95),
                stint(7, "cfc", "Chelsea", "2021", "2022", appearances=44),
                stint(8, "inter", "Inter Milan", "2022", "2023", appearances=37, stint_type="loan"),
                stint(9, "roma", "Roma", "2023", "2024", appearances=47, stint_type="loan"),
                stint(10, "napoli", "Napoli", "2024", None, appearances=8)
            ],
            provider_ids={"transfermarkt": "96341", "wikidata": "Q313316"},
            career_complete=False
        ),
        # 131. Son Heung-min
        player(
            "son_heung_min", "Son Heung-min", "Son Heung-min",
            ["Son", "Sonny"],
            "1992-07-08", ["South Korea"], "active",
            [
                stint(1, "hamburger_sv", "Hamburger SV", "2010", "2013", appearances=78),
                stint(2, "leverkusen", "Bayer Leverkusen", "2013", "2015", appearances=87),
                stint(3, "tottenham", "Tottenham Hotspur", "2015", None, appearances=408)
            ],
            provider_ids={"transfermarkt": "91845", "wikidata": "Q439366"},
            career_complete=False,
            exclusions=[{"club": "Hamburger SV II", "reason": "b-team-only", "evidence": "Played 6 games in Regionalliga Nord in 2009-10 before first team debut in August 2010."}]
        ),
        # 132. Raheem Sterling
        player(
            "raheem_sterling", "Raheem Sterling", "Raheem Shaquille Sterling",
            ["Sterling", "Raheem Shaquille Sterling"],
            "1994-12-08", ["England", "Jamaica"], "active",
            [
                stint(1, "lfc", "Liverpool", "2012", "2015", appearances=129),
                stint(2, "mancity", "Manchester City", "2015", "2022", appearances=339),
                stint(3, "cfc", "Chelsea", "2022", "2024", appearances=81),
                stint(4, "afc", "Arsenal", "2024", None, appearances=6, stint_type="loan")
            ],
            provider_ids={"transfermarkt": "134425", "wikidata": "Q343993"},
            career_complete=False,
            exclusions=[{"club": "Queens Park Rangers", "reason": "youth-academy-only", "evidence": "Played at QPR youth academy 2003-2010 before signing for Liverpool youth academy; 0 senior apps."}]
        ),
        # 133. Sadio Mané
        player(
            "sadio_mane", "Sadio Mané", "Sadio Mané",
            ["Mane", "Sadio Mane"],
            "1992-04-10", ["Senegal"], "active",
            [
                stint(1, "metz", "Metz", "2011", "2012", appearances=23),
                stint(2, "salzburg", "Red Bull Salzburg", "2012", "2014", appearances=87),
                stint(3, "southampton", "Southampton", "2014", "2016", appearances=75),
                stint(4, "lfc", "Liverpool", "2016", "2022", appearances=269),
                stint(5, "bayern", "Bayern Munich", "2022", "2023", appearances=38),
                stint(6, "al_nassr", "Al Nassr", "2023", None, appearances=46)
            ],
            provider_ids={"transfermarkt": "204082", "wikidata": "Q733470"},
            career_complete=False
        ),
        # 134. Roberto Firmino
        player(
            "roberto_firmino", "Roberto Firmino", "Roberto Firmino Barbosa de Oliveira",
            ["Firmino", "Bobby Firmino"],
            "1991-10-02", ["Brazil"], "active",
            [
                stint(1, "figueirense", "Figueirense", "2009", "2010", appearances=38),
                stint(2, "hoffenheim", "TSG 1899 Hoffenheim", "2011", "2015", appearances=153),
                stint(3, "lfc", "Liverpool", "2015", "2023", appearances=362),
                stint(4, "al_ahli", "Al-Ahli", "2023", None, appearances=34)
            ],
            provider_ids={"transfermarkt": "131789", "wikidata": "Q459676"},
            career_complete=False
        ),
        # 135. Eden Hazard
        player(
            "eden_hazard", "Eden Hazard", "Eden Michael Hazard",
            ["Hazard", "Eden Michael Hazard"],
            "1991-01-07", ["Belgium"], "retired",
            [
                stint(1, "lille", "Lille", "2007", "2012", appearances=194),
                stint(2, "cfc", "Chelsea", "2012", "2019", appearances=352),
                stint(3, "rmcf", "Real Madrid", "2019", "2023", appearances=76)
            ],
            provider_ids={"transfermarkt": "50202", "wikidata": "Q44123"},
            career_complete=True
        ),
        # 136. Gareth Bale
        player(
            "gareth_bale", "Gareth Bale", "Gareth Frank Bale",
            ["Bale", "Gareth Frank Bale"],
            "1989-07-16", ["Wales"], "retired",
            [
                stint(1, "southampton", "Southampton", "2006", "2007", appearances=45),
                stint(2, "tottenham", "Tottenham Hotspur", "2007", "2013", appearances=203),
                stint(3, "rmcf", "Real Madrid", "2013", "2020", appearances=251),
                stint(4, "tottenham", "Tottenham Hotspur", "2020", "2021", appearances=34, stint_type="loan"),
                stint(5, "rmcf", "Real Madrid", "2021", "2022", appearances=7),
                stint(6, "lafc", "Los Angeles FC", "2022", "2022", appearances=13)
            ],
            provider_ids={"transfermarkt": "34221", "wikidata": "Q44381"},
            career_complete=True
        ),
        # 137. Paulo Dybala
        player(
            "paulo_dybala", "Paulo Dybala", "Paulo Exequiel Dybala",
            ["Dybala", "La Joya"],
            "1993-11-15", ["Argentina"], "active",
            [
                stint(1, "instituto", "Instituto", "2011", "2012", appearances=40),
                stint(2, "palermo", "Palermo", "2012", "2015", appearances=93),
                stint(3, "juve", "Juventus", "2015", "2022", appearances=293),
                stint(4, "roma", "Roma", "2022", None, appearances=77)
            ],
            provider_ids={"transfermarkt": "206050", "wikidata": "Q166542"},
            career_complete=False
        ),
        # 138. Victor Osimhen
        player(
            "victor_osimhen", "Victor Osimhen", "Victor James Osimhen",
            ["Osimhen", "Victor James Osimhen"],
            "1998-12-29", ["Nigeria"], "active",
            [
                stint(1, "vfl_wolfsburg", "VfL Wolfsburg", "2017", "2018", appearances=16),
                stint(2, "charleroi", "Charleroi", "2018", "2019", appearances=36, stint_type="loan"),
                stint(3, "lille", "Lille", "2019", "2020", appearances=38),
                stint(4, "napoli", "Napoli", "2020", "2024", appearances=133),
                stint(5, "galatasaray", "Galatasaray", "2024", None, appearances=6, stint_type="loan")
            ],
            provider_ids={"transfermarkt": "401923", "wikidata": "Q21622285"},
            career_complete=False
        ),
        # 139. Lautaro Martínez
        player(
            "lautaro_martinez", "Lautaro Martínez", "Lautaro Javier Martínez",
            ["Lautaro", "El Toro", "Lautaro Martinez"],
            "1997-08-22", ["Argentina"], "active",
            [
                stint(1, "racing_club", "Racing Club", "2015", "2018", appearances=62),
                stint(2, "inter", "Inter Milan", "2018", None, appearances=282)
            ],
            provider_ids={"transfermarkt": "406625", "wikidata": "Q21484136"},
            career_complete=False
        ),
        # 140. Kylian Mbappé
        player(
            "kylian_mbappe", "Kylian Mbappé", "Kylian Mbappé Lottin",
            ["Mbappe", "Kylian Mbappe"],
            "1998-12-20", ["France"], "active",
            [
                stint(1, "monaco", "Monaco", "2015", "2017", appearances=60),
                stint(2, "psg", "Paris Saint-Germain", "2017", "2024", appearances=308),
                stint(3, "rmcf", "Real Madrid", "2024", None, appearances=12)
            ],
            provider_ids={"transfermarkt": "342229", "wikidata": "Q21621995"},
            career_complete=False,
            exclusions=[{"club": "Monaco B", "reason": "b-team-only", "evidence": "Played 12 games in CFA before established first-team regular status."}]
        ),
        # 141. Erling Haaland
        player(
            "erling_haaland", "Erling Haaland", "Erling Braut Haaland",
            ["Haaland", "Erling Braut Haaland"],
            "2000-07-21", ["Norway"], "active",
            [
                stint(1, "bryne", "Bryne", "2015", "2016", appearances=16),
                stint(2, "molde", "Molde", "2017", "2018", appearances=50),
                stint(3, "salzburg", "Red Bull Salzburg", "2019", "2020", appearances=27),
                stint(4, "bvb", "Borussia Dortmund", "2020", "2022", appearances=89),
                stint(5, "mancity", "Manchester City", "2022", None, appearances=98)
            ],
            provider_ids={"transfermarkt": "418560", "wikidata": "Q28741353"},
            career_complete=False
        ),
        # 142. Jude Bellingham
        player(
            "jude_bellingham", "Jude Bellingham", "Jude Victor William Bellingham",
            ["Bellingham", "Jude Victor William Bellingham"],
            "2003-06-29", ["England"], "active",
            [
                stint(1, "birmingham", "Birmingham City", "2019", "2020", appearances=44),
                stint(2, "bvb", "Borussia Dortmund", "2020", "2023", appearances=132),
                stint(3, "rmcf", "Real Madrid", "2023", None, appearances=42)
            ],
            provider_ids={"transfermarkt": "581678", "wikidata": "Q66363804"},
            career_complete=False
        ),
        # 143. Rodri
        player(
            "rodri", "Rodri", "Rodrigo Hernández Cascante",
            ["Rodrigo", "Rodrigo Hernandez Cascante", "Rodrigo Hernandez"],
            "1996-06-22", ["Spain"], "active",
            [
                stint(1, "villarreal", "Villarreal", "2015", "2018", appearances=84),
                stint(2, "atletico", "Atlético Madrid", "2018", "2019", appearances=47),
                stint(3, "mancity", "Manchester City", "2019", None, appearances=260)
            ],
            provider_ids={"transfermarkt": "357565", "wikidata": "Q21621465"},
            career_complete=False,
            exclusions=[{"club": "Villarreal B", "reason": "b-team-only", "evidence": "Played in Segunda División B 2015-16; senior debut vs Huesca in Copa del Rey Dec 2015."}]
        ),
        # 144. Casemiro
        player(
            "casemiro", "Casemiro", "Carlos Henrique Casimiro",
            ["Carlos Henrique Casimiro"],
            "1992-02-23", ["Brazil"], "active",
            [
                stint(1, "sao_paulo", "São Paulo", "2010", "2013", appearances=112),
                stint(2, "rmcf", "Real Madrid", "2013", "2014", appearances=27),
                stint(3, "porto", "Porto", "2014", "2015", appearances=41, stint_type="loan"),
                stint(4, "rmcf", "Real Madrid", "2015", "2022", appearances=309),
                stint(5, "manu", "Manchester United", "2022", None, appearances=83)
            ],
            provider_ids={"transfermarkt": "16306", "wikidata": "Q312910"},
            career_complete=False,
            exclusions=[{"club": "Real Madrid Castilla", "reason": "b-team-only", "evidence": "Loan to RM Castilla in 2013 (15 apps in Segunda División); made first team debut vs Real Betis April 2013."}]
        ),
        # 145. Sergio Busquets
        player(
            "sergio_busquets", "Sergio Busquets", "Sergio Busquets Burgos",
            ["Busquets", "Sergio Busquets Burgos"],
            "1988-07-16", ["Spain"], "active",
            [
                stint(1, "fcb", "Barcelona", "2008", "2023", appearances=722),
                stint(2, "inter_miami", "Inter Miami", "2023", None, appearances=45)
            ],
            provider_ids={"transfermarkt": "65230", "wikidata": "Q174744"},
            career_complete=False,
            exclusions=[{"club": "Barcelona B", "reason": "b-team-only", "evidence": "Played 32 matches in Tercera División under Pep Guardiola before promotion to first team."}]
        ),
        # 146. Andrés Iniesta
        player(
            "andres_iniesta", "Andrés Iniesta", "Andrés Iniesta Luján",
            ["Iniesta", "Don Andres", "Andres Iniesta"],
            "1984-05-11", ["Spain"], "retired",
            [
                stint(1, "fcb", "Barcelona", "2002", "2018", appearances=674),
                stint(2, "vissel_kobe", "Vissel Kobe", "2018", "2023", appearances=134),
                stint(3, "emirates_club", "Emirates Club", "2023", "2024", appearances=23)
            ],
            provider_ids={"transfermarkt": "7600", "wikidata": "Q44184"},
            career_complete=True,
            exclusions=[{"club": "Barcelona B", "reason": "b-team-only", "evidence": "Played 54 matches in Segunda División B 2001-2003; senior first team debut was 29 Oct 2002 vs Club Brugge in Champions League."}]
        ),
        # 147. Xavi
        player(
            "xavi", "Xavi", "Xavier Hernández Creus",
            ["Xavier Hernandez", "Xavier Hernandez Creus", "Xavi Hernandez"],
            "1980-01-25", ["Spain"], "retired",
            [
                stint(1, "fcb", "Barcelona", "1998", "2015", appearances=767),
                stint(2, "al_sadd", "Al Sadd", "2015", "2019", appearances=117)
            ],
            provider_ids={"transfermarkt": "7607", "wikidata": "Q17500"},
            career_complete=True,
            exclusions=[{"club": "Barcelona B", "reason": "b-team-only", "evidence": "Played 55 matches in Segunda División 1997-1999."}]
        ),
        # 148. Andrea Pirlo
        player(
            "andrea_pirlo", "Andrea Pirlo", "Andrea Pirlo",
            ["Pirlo", "Il Maestro"],
            "1979-05-19", ["Italy"], "retired",
            [
                stint(1, "brescia", "Brescia", "1995", "1998", appearances=49),
                stint(2, "inter", "Inter Milan", "1998", "1999", appearances=32),
                stint(3, "reggina", "Reggina", "1999", "2000", appearances=30, stint_type="loan"),
                stint(4, "inter", "Inter Milan", "2000", "2001", appearances=8),
                stint(5, "brescia", "Brescia", "2001", "2001", appearances=10, stint_type="loan"),
                stint(6, "acmilan", "AC Milan", "2001", "2011", appearances=401),
                stint(7, "juve", "Juventus", "2011", "2015", appearances=164),
                stint(8, "nycfc", "New York City FC", "2015", "2017", appearances=62)
            ],
            provider_ids={"transfermarkt": "5825", "wikidata": "Q43926"},
            career_complete=True
        ),
        # 149. Frank Lampard
        player(
            "frank_lampard", "Frank Lampard", "Frank James Lampard",
            ["Lampard", "Super Frank", "Frank James Lampard"],
            "1978-06-20", ["England"], "retired",
            [
                stint(1, "west_ham", "West Ham United", "1995", "1995", appearances=2),
                stint(2, "swansea", "Swansea City", "1995", "1996", appearances=11, stint_type="loan"),
                stint(3, "west_ham", "West Ham United", "1996", "2001", appearances=185),
                stint(4, "cfc", "Chelsea", "2001", "2014", appearances=648),
                stint(5, "mancity", "Manchester City", "2014", "2015", appearances=38),
                stint(6, "nycfc", "New York City FC", "2015", "2016", appearances=31)
            ],
            provider_ids={"transfermarkt": "3163", "wikidata": "Q41533"},
            career_complete=True
        ),
        # 150. David Silva
        player(
            "david_silva", "David Silva", "David Josué Jiménez Silva",
            ["Silva", "El Mago", "David Josue Jimenez Silva"],
            "1986-01-08", ["Spain"], "retired",
            [
                stint(1, "eibar", "Eibar", "2004", "2005", appearances=35, stint_type="loan"),
                stint(2, "celta_vigo", "Celta Vigo", "2005", "2006", appearances=38, stint_type="loan"),
                stint(3, "valencia", "Valencia", "2006", "2010", appearances=168),
                stint(4, "mancity", "Manchester City", "2010", "2020", appearances=436),
                stint(5, "real_sociedad", "Real Sociedad", "2020", "2023", appearances=93)
            ],
            provider_ids={"transfermarkt": "35518", "wikidata": "Q484912"},
            career_complete=True,
            exclusions=[{"club": "Valencia Mestalla", "reason": "b-team-only", "evidence": "Played in Segunda B in 2003-04 before professional senior loans to Eibar and Celta Vigo."}]
        ),
        # 151. Mesut Özil
        player(
            "mesut_ozil", "Mesut Özil", "Mesut Özil",
            ["Ozil", "Mesut Oezil"],
            "1988-10-15", ["Germany"], "retired",
            [
                stint(1, "schalke", "Schalke 04", "2006", "2008", appearances=39),
                stint(2, "werder_bremen", "Werder Bremen", "2008", "2010", appearances=108),
                stint(3, "rmcf", "Real Madrid", "2010", "2013", appearances=159),
                stint(4, "afc", "Arsenal", "2013", "2021", appearances=254),
                stint(5, "fenerbahce", "Fenerbahçe", "2021", "2022", appearances=37),
                stint(6, "basaksehir", "İstanbul Başakşehir", "2022", "2023", appearances=7)
            ],
            provider_ids={"transfermarkt": "35664", "wikidata": "Q47159"},
            career_complete=True
        ),
        # 152. Paul Pogba
        player(
            "paul_pogba", "Paul Pogba", "Paul Labilé Pogba",
            ["Pogba", "Paul Labile Pogba"],
            "1993-03-15", ["France", "Guinea"], "active",
            [
                stint(1, "manu", "Manchester United", "2011", "2012", appearances=7),
                stint(2, "juve", "Juventus", "2012", "2016", appearances=178),
                stint(3, "manu", "Manchester United", "2016", "2022", appearances=226),
                stint(4, "juve", "Juventus", "2022", None, appearances=12)
            ],
            provider_ids={"transfermarkt": "122153", "wikidata": "Q129027"},
            career_complete=False
        ),
        # 153. N'Golo Kanté
        player(
            "ngolo_kante", "N'Golo Kanté", "N'Golo Kanté",
            ["Kante", "N'Golo Kante", "Ngolo Kante"],
            "1991-03-29", ["France", "Mali"], "active",
            [
                stint(1, "boulogne", "Boulogne", "2012", "2013", appearances=40),
                stint(2, "caen", "Caen", "2013", "2015", appearances=81),
                stint(3, "leicester", "Leicester City", "2015", "2016", appearances=40),
                stint(4, "cfc", "Chelsea", "2016", "2023", appearances=269),
                stint(5, "al_ittihad", "Al-Ittihad", "2023", None, appearances=44)
            ],
            provider_ids={"transfermarkt": "225083", "wikidata": "Q16665977"},
            career_complete=False
        ),
        # 154. İlkay Gündoğan
        player(
            "ilkay_gundogan", "İlkay Gündoğan", "İlkay Gündoğan",
            ["Gundogan", "Ilkay Gundogan", "Ilkay Guendogan"],
            "1990-10-24", ["Germany"], "active",
            [
                stint(1, "nurnberg", "1. FC Nürnberg", "2009", "2011", appearances=53),
                stint(2, "bvb", "Borussia Dortmund", "2011", "2016", appearances=157),
                stint(3, "mancity", "Manchester City", "2016", "2023", appearances=304),
                stint(4, "fcb", "Barcelona", "2023", "2024", appearances=51),
                stint(5, "mancity", "Manchester City", "2024", None, appearances=8)
            ],
            provider_ids={"transfermarkt": "53507", "wikidata": "Q153405"},
            career_complete=False,
            exclusions=[{"club": "VfL Bochum II", "reason": "b-team-only", "evidence": "Played 2 matches in Regionalliga West in 2008-09 before professional transfer to Nürnberg."}]
        ),
        # 155. Jordan Henderson
        player(
            "jordan_henderson", "Jordan Henderson", "Jordan Brian Henderson",
            ["Henderson", "Jordan Brian Henderson"],
            "1990-06-17", ["England"], "active",
            [
                stint(1, "sunderland", "Sunderland", "2008", "2009", appearances=2),
                stint(2, "coventry", "Coventry City", "2009", "2009", appearances=13, stint_type="loan"),
                stint(3, "sunderland", "Sunderland", "2009", "2011", appearances=77),
                stint(4, "lfc", "Liverpool", "2011", "2023", appearances=492),
                stint(5, "al_ettifaq", "Al-Ettifaq", "2023", "2024", appearances=19),
                stint(6, "ajax", "Ajax", "2024", None, appearances=16)
            ],
            provider_ids={"transfermarkt": "61642", "wikidata": "Q273722"},
            career_complete=False
        ),
        # 156. Koke
        player(
            "koke", "Koke", "Jorge Resurrección Merodio",
            ["Jorge Resurreccion Merodio"],
            "1992-01-08", ["Spain"], "active",
            [
                stint(1, "atletico", "Atlético Madrid", "2009", None, appearances=640)
            ],
            provider_ids={"transfermarkt": "74229", "wikidata": "Q44040"},
            career_complete=False,
            exclusions=[{"club": "Atlético Madrid B", "reason": "b-team-only", "evidence": "Played in Segunda División B 2008-2011; senior first-team debut on 19 Sept 2009 vs Almería."}]
        ),
        # 157. Isco
        player(
            "isco", "Isco", "Francisco Román Alarcón Suárez",
            ["Francisco Roman Alarcon Suarez"],
            "1992-04-21", ["Spain"], "active",
            [
                stint(1, "valencia", "Valencia", "2010", "2011", appearances=7),
                stint(2, "malaga", "Málaga", "2011", "2013", appearances=82),
                stint(3, "rmcf", "Real Madrid", "2013", "2022", appearances=353),
                stint(4, "sevilla", "Sevilla", "2022", "2022", appearances=19),
                stint(5, "betis", "Real Betis", "2023", None, appearances=36)
            ],
            provider_ids={"transfermarkt": "85288", "wikidata": "Q269894"},
            career_complete=False,
            exclusions=[{"club": "Valencia Mestalla", "reason": "b-team-only", "evidence": "Played in Tercera División; scored twice in senior debut for Valencia first team in Copa del Rey on 11 Nov 2010."}]
        ),
        # 158. Alexis Sánchez
        player(
            "alexis_sanchez", "Alexis Sánchez", "Alexis Alejandro Sánchez Sánchez",
            ["Alexis", "El Nino Maravilla", "Alexis Alejandro Sanchez"],
            "1988-12-19", ["Chile"], "active",
            [
                stint(1, "cobreloa", "Cobreloa", "2005", "2006", appearances=50),
                stint(2, "colo_colo", "Colo-Colo", "2006", "2007", appearances=48, stint_type="loan"),
                stint(3, "river_plate", "River Plate", "2007", "2008", appearances=31, stint_type="loan"),
                stint(4, "udinese", "Udinese", "2008", "2011", appearances=112),
                stint(5, "fcb", "Barcelona", "2011", "2014", appearances=141),
                stint(6, "afc", "Arsenal", "2014", "2018", appearances=166),
                stint(7, "manu", "Manchester United", "2018", "2019", appearances=45),
                stint(8, "inter", "Inter Milan", "2019", "2022", appearances=109),
                stint(9, "marseille", "Marseille", "2022", "2023", appearances=44),
                stint(10, "inter", "Inter Milan", "2023", "2024", appearances=33),
                stint(11, "udinese", "Udinese", "2024", None, appearances=1)
            ],
            provider_ids={"transfermarkt": "40433", "wikidata": "Q179124"},
            career_complete=False,
            conflict_resolutions=[{"topic": "Name Disambiguation", "resolution": "Alexis Sánchez (Chilean forward, b. 1988) resolved independently from Davinson Sánchez (Colombian centre-back, b. 1996)."}]
        ),
        # 159. Thibaut Courtois
        player(
            "thibaut_courtois", "Thibaut Courtois", "Thibaut Nicolas Marc Courtois",
            ["Courtois", "Thibaut Nicolas Marc Courtois"],
            "1992-05-11", ["Belgium"], "active",
            [
                stint(1, "genk", "Genk", "2009", "2011", appearances=45),
                stint(2, "atletico", "Atlético Madrid", "2011", "2014", appearances=154, stint_type="loan"),
                stint(3, "cfc", "Chelsea", "2014", "2018", appearances=154),
                stint(4, "rmcf", "Real Madrid", "2018", None, appearances=235)
            ],
            provider_ids={"transfermarkt": "108390", "wikidata": "Q73356"},
            career_complete=False
        ),
        # 160. Manuel Neuer
        player(
            "manuel_neuer", "Manuel Neuer", "Manuel Peter Neuer",
            ["Neuer", "Manuel Peter Neuer"],
            "1986-03-27", ["Germany"], "active",
            [
                stint(1, "schalke", "Schalke 04", "2005", "2011", appearances=203),
                stint(2, "bayern", "Bayern Munich", "2011", None, appearances=520)
            ],
            provider_ids={"transfermarkt": "17259", "wikidata": "Q107365"},
            career_complete=False,
            exclusions=[{"club": "Schalke 04 II", "reason": "b-team-only", "evidence": "Played 29 games in Oberliga Westfalen 2004-2008; senior first team debut was August 2006."}]
        ),
        # 161. Gianluigi Buffon
        player(
            "gianluigi_buffon", "Gianluigi Buffon", "Gianluigi Buffon",
            ["Buffon", "Gigi Buffon"],
            "1978-01-28", ["Italy"], "retired",
            [
                stint(1, "parma", "Parma", "1995", "2001", appearances=220),
                stint(2, "juve", "Juventus", "2001", "2018", appearances=656),
                stint(3, "psg", "Paris Saint-Germain", "2018", "2019", appearances=25),
                stint(4, "juve", "Juventus", "2019", "2021", appearances=29),
                stint(5, "parma", "Parma", "2021", "2023", appearances=45)
            ],
            provider_ids={"transfermarkt": "5023", "wikidata": "Q9280"},
            career_complete=True
        ),
        # 162. Iker Casillas
        player(
            "iker_casillas", "Iker Casillas", "Iker Casillas Fernández",
            ["Casillas", "San Iker", "Iker Casillas Fernandez"],
            "1981-05-20", ["Spain"], "retired",
            [
                stint(1, "rmcf", "Real Madrid", "1999", "2015", appearances=725),
                stint(2, "porto", "Porto", "2015", "2020", appearances=156)
            ],
            provider_ids={"transfermarkt": "3979", "wikidata": "Q11584"},
            career_complete=True,
            exclusions=[{"club": "Real Madrid C / B", "reason": "b-team-only", "evidence": "Played in Tercera and Segunda B 1998-1999 before debut on 12 Sept 1999 vs Athletic Bilbao."}]
        ),
        # 163. Hugo Lloris
        player(
            "hugo_lloris", "Hugo Lloris", "Hugo Hadrien Dominique Lloris",
            ["Lloris", "Hugo Hadrien Dominique Lloris"],
            "1986-12-26", ["France"], "active",
            [
                stint(1, "nice", "Nice", "2005", "2008", appearances=78),
                stint(2, "lyon", "Lyon", "2008", "2012", appearances=201),
                stint(3, "tottenham", "Tottenham Hotspur", "2012", "2024", appearances=444),
                stint(4, "lafc", "Los Angeles FC", "2024", None, appearances=33)
            ],
            provider_ids={"transfermarkt": "17905", "wikidata": "Q164104"},
            career_complete=False
        ),
        # 164. Keylor Navas
        player(
            "keylor_navas", "Keylor Navas", "Keilor Antonio Navas Gamboa",
            ["Navas", "Keilor Antonio Navas Gamboa"],
            "1986-12-15", ["Costa Rica"], "active",
            [
                stint(1, "saprissa", "Deportivo Saprissa", "2005", "2010", appearances=60),
                stint(2, "albacete", "Albacete", "2010", "2011", appearances=36),
                stint(3, "levante", "Levante", "2011", "2014", appearances=70),
                stint(4, "rmcf", "Real Madrid", "2014", "2019", appearances=162),
                stint(5, "psg", "Paris Saint-Germain", "2019", "2023", appearances=108),
                stint(6, "nottingham_forest", "Nottingham Forest", "2023", "2023", appearances=17, stint_type="loan"),
                stint(7, "psg", "Paris Saint-Germain", "2023", "2024", appearances=6)
            ],
            provider_ids={"transfermarkt": "72428", "wikidata": "Q360658"},
            career_complete=False
        ),
        # 165. Jan Oblak
        player(
            "jan_oblak", "Jan Oblak", "Jan Oblak",
            ["Oblak"],
            "1993-01-07", ["Slovenia"], "active",
            [
                stint(1, "olimpija_ljubljana", "Olimpija Ljubljana", "2009", "2010", appearances=34),
                stint(2, "beira_mar", "Beira-Mar", "2010", "2010", appearances=2, stint_type="loan"),
                stint(3, "uniao_leiria", "União de Leiria", "2011", "2012", appearances=17, stint_type="loan"),
                stint(4, "rio_ave", "Rio Ave", "2012", "2013", appearances=31, stint_type="loan"),
                stint(5, "benfica", "Benfica", "2013", "2014", appearances=26),
                stint(6, "atletico", "Atlético Madrid", "2014", None, appearances=446)
            ],
            provider_ids={"transfermarkt": "121483", "wikidata": "Q205624"},
            career_complete=False,
            exclusions=[{"club": "Olhanense", "reason": "no-senior-appearances", "evidence": "Loaned from Benfica in Jan 2011; made 0 official senior appearances."}]
        ),
        # 166. Alisson Becker
        player(
            "alisson_becker", "Alisson Becker", "Álisson Ramsés Becker",
            ["Alisson", "Alisson Ramses Becker"],
            "1992-10-02", ["Brazil"], "active",
            [
                stint(1, "internacional", "Internacional", "2013", "2016", appearances=101),
                stint(2, "roma", "Roma", "2016", "2018", appearances=64),
                stint(3, "lfc", "Liverpool", "2018", None, appearances=263)
            ],
            provider_ids={"transfermarkt": "105470", "wikidata": "Q17477903"},
            career_complete=False
        ),
        # 167. Ederson
        player(
            "ederson", "Ederson", "Ederson Santana de Moraes",
            ["Ederson Moraes", "Ederson Santana de Moraes"],
            "1993-08-17", ["Brazil"], "active",
            [
                stint(1, "ribeirao", "Ribeirão", "2011", "2012", appearances=30),
                stint(2, "rio_ave", "Rio Ave", "2012", "2015", appearances=63),
                stint(3, "benfica", "Benfica", "2015", "2017", appearances=56),
                stint(4, "mancity", "Manchester City", "2017", None, appearances=332)
            ],
            provider_ids={"transfermarkt": "238223", "wikidata": "Q10552796"},
            career_complete=False,
            exclusions=[{"club": "Benfica B", "reason": "b-team-only", "evidence": "Played 4 matches for Benfica B in Segunda Liga 2015-16 before winning first team starting role."}]
        ),
        # 168. Marc-André ter Stegen
        player(
            "marc_andre_ter_stegen", "Marc-André ter Stegen", "Marc-André ter Stegen",
            ["Ter Stegen", "Marc-Andre ter Stegen"],
            "1992-04-30", ["Germany"], "active",
            [
                stint(1, "bmg", "Borussia Mönchengladbach", "2011", "2014", appearances=127),
                stint(2, "fcb", "Barcelona", "2014", None, appearances=413)
            ],
            provider_ids={"transfermarkt": "74857", "wikidata": "Q164100"},
            career_complete=False,
            exclusions=[{"club": "Borussia Mönchengladbach II", "reason": "b-team-only", "evidence": "Played in Regionalliga West 2009-2011 before senior Bundesliga debut on 10 April 2011."}]
        ),
        # 169. Virgil van Dijk
        player(
            "virgil_van_dijk", "Virgil van Dijk", "Virgil van Dijk",
            ["Van Dijk", "VVD"],
            "1991-07-08", ["Netherlands"], "active",
            [
                stint(1, "groningen", "Groningen", "2011", "2013", appearances=66),
                stint(2, "celtic", "Celtic", "2013", "2015", appearances=115),
                stint(3, "southampton", "Southampton", "2015", "2018", appearances=80),
                stint(4, "lfc", "Liverpool", "2018", None, appearances=270)
            ],
            provider_ids={"transfermarkt": "139208", "wikidata": "Q1339174"},
            career_complete=False
        ),
        # 170. Thiago Silva
        player(
            "thiago_silva", "Thiago Silva", "Thiago Emiliano da Silva",
            ["Silva", "O Monstro", "Thiago Emiliano da Silva"],
            "1984-09-22", ["Brazil", "France"], "active",
            [
                stint(1, "rs_futebol", "RS Futebol", "2002", "2003", appearances=25),
                stint(2, "juventude", "Juventude", "2003", "2004", appearances=28),
                stint(3, "fluminense", "Fluminense", "2006", "2008", appearances=143),
                stint(4, "acmilan", "AC Milan", "2009", "2012", appearances=119),
                stint(5, "psg", "Paris Saint-Germain", "2012", "2020", appearances=315),
                stint(6, "cfc", "Chelsea", "2020", "2024", appearances=155),
                stint(7, "fluminense", "Fluminense", "2024", None, appearances=12)
            ],
            provider_ids={"transfermarkt": "29241", "wikidata": "Q206771"},
            career_complete=False,
            exclusions=[
                {"club": "Porto", "reason": "b-team-only", "evidence": "Signed by Porto in 2004 but only played for Porto B in Segunda Liga (14 matches); 0 first-team appearances."},
                {"club": "Dynamo Moscow", "reason": "no-senior-appearances", "evidence": "Loaned/signed in 2005; hospitalized with severe tuberculosis for six months; 0 official senior appearances."}
            ]
        ),
        # 171. Giorgio Chiellini
        player(
            "giorgio_chiellini", "Giorgio Chiellini", "Giorgio Chiellini",
            ["Chiellini"],
            "1984-08-14", ["Italy"], "retired",
            [
                stint(1, "livorno", "Livorno", "2000", "2004", appearances=62),
                stint(2, "fiorentina", "Fiorentina", "2004", "2005", appearances=42),
                stint(3, "juve", "Juventus", "2005", "2022", appearances=561),
                stint(4, "lafc", "Los Angeles FC", "2022", "2023", appearances=45)
            ],
            provider_ids={"transfermarkt": "29260", "wikidata": "Q182747"},
            career_complete=True
        ),
        # 172. Leonardo Bonucci
        player(
            "leonardo_bonucci", "Leonardo Bonucci", "Leonardo Bonucci",
            ["Bonucci"],
            "1987-05-01", ["Italy"], "retired",
            [
                stint(1, "inter", "Inter Milan", "2005", "2007", appearances=4),
                stint(2, "treviso", "Treviso", "2007", "2009", appearances=43, stint_type="loan"),
                stint(3, "pisa", "Pisa", "2009", "2009", appearances=18, stint_type="loan"),
                stint(4, "bari", "Bari", "2009", "2010", appearances=39),
                stint(5, "juve", "Juventus", "2010", "2017", appearances=319),
                stint(6, "acmilan", "AC Milan", "2017", "2018", appearances=51),
                stint(7, "juve", "Juventus", "2018", "2023", appearances=183),
                stint(8, "union_berlin", "Union Berlin", "2023", "2024", appearances=10),
                stint(9, "fenerbahce", "Fenerbahçe", "2024", "2024", appearances=13)
            ],
            provider_ids={"transfermarkt": "39983", "wikidata": "Q216371"},
            career_complete=True
        ),
        # 173. Gerard Piqué
        player(
            "gerard_pique", "Gerard Piqué", "Gerard Piqué Bernabéu",
            ["Pique", "Gerard Pique Bernabeu"],
            "1987-02-02", ["Spain"], "retired",
            [
                stint(1, "manu", "Manchester United", "2004", "2006", appearances=7),
                stint(2, "zaragoza", "Real Zaragoza", "2006", "2007", appearances=28, stint_type="loan"),
                stint(3, "manu", "Manchester United", "2007", "2008", appearances=16),
                stint(4, "fcb", "Barcelona", "2008", "2022", appearances=616)
            ],
            provider_ids={"transfermarkt": "18944", "wikidata": "Q41997"},
            career_complete=True
        ),
        # 174. Rio Ferdinand
        player(
            "rio_ferdinand", "Rio Ferdinand", "Rio Gavin Ferdinand",
            ["Ferdinand", "Rio Gavin Ferdinand"],
            "1978-11-07", ["England"], "retired",
            [
                stint(1, "west_ham", "West Ham United", "1995", "1996", appearances=1),
                stint(2, "bournemouth", "AFC Bournemouth", "1996", "1996", appearances=11, stint_type="loan"),
                stint(3, "west_ham", "West Ham United", "1996", "2000", appearances=157),
                stint(4, "leeds", "Leeds United", "2000", "2002", appearances=73),
                stint(5, "manu", "Manchester United", "2002", "2014", appearances=455),
                stint(6, "qpr", "Queens Park Rangers", "2014", "2015", appearances=12)
            ],
            provider_ids={"transfermarkt": "3235", "wikidata": "Q483417"},
            career_complete=True
        ),
        # 175. Nemanja Vidić
        player(
            "nemanja_vidic", "Nemanja Vidić", "Nemanja Vidić",
            ["Vidic", "Nemanja Vidic"],
            "1981-10-21", ["Serbia"], "retired",
            [
                stint(1, "red_star", "Red Star Belgrade", "2000", "2000", appearances=0),
                stint(2, "spartak_subotica", "Spartak Subotica", "2000", "2001", appearances=27, stint_type="loan"),
                stint(3, "red_star", "Red Star Belgrade", "2001", "2004", appearances=92),
                stint(4, "spartak_moscow", "Spartak Moscow", "2004", "2006", appearances=41),
                stint(5, "manu", "Manchester United", "2006", "2014", appearances=300),
                stint(6, "inter", "Inter Milan", "2014", "2016", appearances=28)
            ],
            provider_ids={"transfermarkt": "19774", "wikidata": "Q174783"},
            career_complete=True
        ),
        # 176. John Terry
        player(
            "john_terry", "John Terry", "John George Terry",
            ["Terry", "Captain, Leader, Legend", "John George Terry"],
            "1980-12-07", ["England"], "retired",
            [
                stint(1, "cfc", "Chelsea", "1998", "2000", appearances=16),
                stint(2, "nottingham_forest", "Nottingham Forest", "2000", "2000", appearances=6, stint_type="loan"),
                stint(3, "cfc", "Chelsea", "2000", "2017", appearances=701),
                stint(4, "aston_villa", "Aston Villa", "2017", "2018", appearances=36)
            ],
            provider_ids={"transfermarkt": "3176", "wikidata": "Q44136"},
            career_complete=True
        ),
        # 177. Vincent Kompany
        player(
            "vincent_kompany", "Vincent Kompany", "Vincent Jean Mpoy Kompany",
            ["Kompany", "Vincent Jean Mpoy Kompany"],
            "1986-04-10", ["Belgium"], "retired",
            [
                stint(1, "anderlecht", "Anderlecht", "2003", "2006", appearances=103),
                stint(2, "hamburger_sv", "Hamburger SV", "2006", "2008", appearances=51),
                stint(3, "mancity", "Manchester City", "2008", "2019", appearances=360),
                stint(4, "anderlecht", "Anderlecht", "2019", "2020", appearances=18)
            ],
            provider_ids={"transfermarkt": "9594", "wikidata": "Q186411"},
            career_complete=True
        ),
        # 178. Marcelo
        player(
            "marcelo", "Marcelo", "Marcelo Vieira da Silva Júnior",
            ["Marcelo Vieira", "Marcelo Vieira da Silva Junior"],
            "1988-05-12", ["Brazil", "Spain"], "active",
            [
                stint(1, "fluminense", "Fluminense", "2005", "2006", appearances=30),
                stint(2, "rmcf", "Real Madrid", "2007", "2022", appearances=546),
                stint(3, "olympiacos", "Olympiacos", "2022", "2023", appearances=10),
                stint(4, "fluminense", "Fluminense", "2023", None, appearances=68)
            ],
            provider_ids={"transfermarkt": "44501", "wikidata": "Q6079"},
            career_complete=False
        ),
        # 179. Dani Alves
        player(
            "dani_alves", "Dani Alves", "Daniel Alves da Silva",
            ["Alves", "Daniel Alves da Silva"],
            "1983-05-06", ["Brazil", "Spain"], "retired",
            [
                stint(1, "bahia", "Bahia", "2001", "2002", appearances=37),
                stint(2, "sevilla", "Sevilla", "2002", "2008", appearances=250),
                stint(3, "fcb", "Barcelona", "2008", "2016", appearances=391),
                stint(4, "juve", "Juventus", "2016", "2017", appearances=33),
                stint(5, "psg", "Paris Saint-Germain", "2017", "2019", appearances=73),
                stint(6, "sao_paulo", "São Paulo", "2019", "2021", appearances=95),
                stint(7, "fcb", "Barcelona", "2021", "2022", appearances=17),
                stint(8, "pumas", "UNAM Pumas", "2022", "2023", appearances=13)
            ],
            provider_ids={"transfermarkt": "15951", "wikidata": "Q172720"},
            career_complete=True
        ),
        # 180. Philipp Lahm
        player(
            "philipp_lahm", "Philipp Lahm", "Philipp Lahm",
            ["Lahm", "The Magic Dwarf"],
            "1983-11-11", ["Germany"], "retired",
            [
                stint(1, "bayern", "Bayern Munich", "2002", "2003", appearances=1),
                stint(2, "stuttgart", "VfB Stuttgart", "2003", "2005", appearances=71, stint_type="loan"),
                stint(3, "bayern", "Bayern Munich", "2005", "2017", appearances=516)
            ],
            provider_ids={"transfermarkt": "2219", "wikidata": "Q43689"},
            career_complete=True,
            exclusions=[{"club": "Bayern Munich II", "reason": "b-team-only", "evidence": "Played 63 matches in Regionalliga Süd 2001-2003."}]
        ),
        # 181. Dani Carvajal
        player(
            "dani_carvajal", "Dani Carvajal", "Daniel Carvajal Ramos",
            ["Carvajal", "Daniel Carvajal Ramos"],
            "1992-01-11", ["Spain"], "active",
            [
                stint(1, "leverkusen", "Bayer Leverkusen", "2012", "2013", appearances=36),
                stint(2, "rmcf", "Real Madrid", "2013", None, appearances=416)
            ],
            provider_ids={"transfermarkt": "138927", "wikidata": "Q657675"},
            career_complete=False,
            exclusions=[{"club": "Real Madrid Castilla", "reason": "b-team-only", "evidence": "Played 68 matches in Segunda B; transferred to Leverkusen in 2012 before Real Madrid exercised buy-back in 2013."}]
        ),
        # 182. Kyle Walker
        player(
            "kyle_walker", "Kyle Walker", "Kyle Andrew Walker",
            ["Walker", "Kyle Andrew Walker"],
            "1990-05-28", ["England"], "active",
            [
                stint(1, "sheffield_united", "Sheffield United", "2008", "2008", appearances=0),
                stint(2, "northampton", "Northampton Town", "2008", "2008", appearances=9, stint_type="loan"),
                stint(3, "sheffield_united", "Sheffield United", "2009", "2009", appearances=35),
                stint(4, "tottenham", "Tottenham Hotspur", "2009", "2009", appearances=2),
                stint(5, "sheffield_united", "Sheffield United", "2009", "2010", appearances=26, stint_type="loan"),
                stint(6, "qpr", "Queens Park Rangers", "2010", "2011", appearances=20, stint_type="loan"),
                stint(7, "aston_villa", "Aston Villa", "2011", "2011", appearances=18, stint_type="loan"),
                stint(8, "tottenham", "Tottenham Hotspur", "2011", "2017", appearances=226),
                stint(9, "mancity", "Manchester City", "2017", None, appearances=301)
            ],
            provider_ids={"transfermarkt": "95424", "wikidata": "Q297276"},
            career_complete=False
        ),
        # 183. Trent Alexander-Arnold
        player(
            "trent_alexander_arnold", "Trent Alexander-Arnold", "Trent John Alexander-Arnold",
            ["Alexander-Arnold", "TAA", "Trent John Alexander-Arnold"],
            "1998-10-07", ["England"], "active",
            [
                stint(1, "lfc", "Liverpool", "2016", None, appearances=310)
            ],
            provider_ids={"transfermarkt": "314353", "wikidata": "Q27576080"},
            career_complete=False
        ),
        # 184. Andrew Robertson
        player(
            "andrew_robertson", "Andrew Robertson", "Andrew Henry Robertson",
            ["Robertson", "Andy Robertson", "Andrew Henry Robertson"],
            "1994-03-11", ["Scotland"], "active",
            [
                stint(1, "queens_park", "Queen's Park", "2012", "2013", appearances=43),
                stint(2, "dundee_united", "Dundee United", "2013", "2014", appearances=44),
                stint(3, "hull_city", "Hull City", "2014", "2017", appearances=115),
                stint(4, "lfc", "Liverpool", "2017", None, appearances=297)
            ],
            provider_ids={"transfermarkt": "234803", "wikidata": "Q10553995"},
            career_complete=False
        ),
        # 185. Joshua Kimmich
        player(
            "joshua_kimmich", "Joshua Kimmich", "Joshua Walter Kimmich",
            ["Kimmich", "Joshua Walter Kimmich"],
            "1995-02-08", ["Germany"], "active",
            [
                stint(1, "rb_leipzig", "RB Leipzig", "2013", "2015", appearances=55),
                stint(2, "bayern", "Bayern Munich", "2015", None, appearances=390)
            ],
            provider_ids={"transfermarkt": "161056", "wikidata": "Q15821733"},
            career_complete=False
        ),
        # 186. Marco Reus
        player(
            "marco_reus", "Marco Reus", "Marco Reus",
            ["Reus"],
            "1989-05-31", ["Germany"], "active",
            [
                stint(1, "rot_weiss_ahlen", "Rot Weiss Ahlen", "2007", "2009", appearances=45),
                stint(2, "bmg", "Borussia Mönchengladbach", "2009", "2012", appearances=109),
                stint(3, "bvb", "Borussia Dortmund", "2012", "2024", appearances=429),
                stint(4, "la_galaxy", "LA Galaxy", "2024", None, appearances=6)
            ],
            provider_ids={"transfermarkt": "35207", "wikidata": "Q152377"},
            career_complete=False,
            exclusions=[{"club": "Rot Weiss Ahlen II", "reason": "b-team-only", "evidence": "Played 6 games in Oberliga Westfalen 2006-07 before senior 1st team promotion."}]
        ),
        # 187. Thomas Müller
        player(
            "thomas_muller", "Thomas Müller", "Thomas Müller",
            ["Muller", "Thomas Mueller"],
            "1989-09-13", ["Germany"], "active",
            [
                stint(1, "bayern", "Bayern Munich", "2008", None, appearances=707)
            ],
            provider_ids={"transfermarkt": "58358", "wikidata": "Q43666"},
            career_complete=False,
            exclusions=[{"club": "Bayern Munich II", "reason": "b-team-only", "evidence": "Played 35 games in 3. Liga 2007-2009; senior first team debut was 15 August 2008 vs Hamburger SV."}]
        ),
        # 188. Bastian Schweinsteiger
        player(
            "bastian_schweinsteiger", "Bastian Schweinsteiger", "Bastian Schweinsteiger",
            ["Schweinsteiger", "Basti"],
            "1984-08-01", ["Germany"], "retired",
            [
                stint(1, "bayern", "Bayern Munich", "2002", "2015", appearances=500),
                stint(2, "manu", "Manchester United", "2015", "2017", appearances=35),
                stint(3, "chicago_fire", "Chicago Fire", "2017", "2019", appearances=92)
            ],
            provider_ids={"transfermarkt": "2514", "wikidata": "Q44298"},
            career_complete=True,
            exclusions=[{"club": "Bayern Munich II", "reason": "b-team-only", "evidence": "Played in Regionalliga Süd 2002-2004."}]
        ),
        # 189. Mario Balotelli
        player(
            "mario_balotelli", "Mario Balotelli", "Mario Balotelli Barwuah",
            ["Balotelli", "Super Mario", "Mario Balotelli Barwuah"],
            "1990-08-12", ["Italy", "Ghana"], "active",
            [
                stint(1, "lumezzane", "Lumezzane", "2005", "2006", appearances=2),
                stint(2, "inter", "Inter Milan", "2007", "2010", appearances=86),
                stint(3, "mancity", "Manchester City", "2010", "2013", appearances=80),
                stint(4, "acmilan", "AC Milan", "2013", "2014", appearances=54),
                stint(5, "lfc", "Liverpool", "2014", "2015", appearances=28),
                stint(6, "acmilan", "AC Milan", "2015", "2016", appearances=23, stint_type="loan"),
                stint(7, "nice", "Nice", "2016", "2019", appearances=76),
                stint(8, "marseille", "Marseille", "2019", "2019", appearances=15),
                stint(9, "brescia", "Brescia", "2019", "2020", appearances=19),
                stint(10, "monza", "Monza", "2020", "2021", appearances=14),
                stint(11, "adana_demirspor", "Adana Demirspor", "2021", "2022", appearances=35),
                stint(12, "sion", "Sion", "2022", "2023", appearances=19),
                stint(13, "adana_demirspor", "Adana Demirspor", "2023", "2024", appearances=16),
                stint(14, "genoa", "Genooa", "2024", None, appearances=2)
            ],
            provider_ids={"transfermarkt": "45146", "wikidata": "Q45969"},
            career_complete=False
        ),
        # 190. Ciro Immobile
        player(
            "ciro_immobile", "Ciro Immobile", "Ciro Immobile",
            ["Immobile"],
            "1990-02-20", ["Italy"], "active",
            [
                stint(1, "juve", "Juventus", "2009", "2010", appearances=5),
                stint(2, "siena", "Siena", "2010", "2011", appearances=6, stint_type="loan"),
                stint(3, "grosseto", "Grosseto", "2011", "2011", appearances=16, stint_type="loan"),
                stint(4, "pescara", "Pescara", "2011", "2012", appearances=37, stint_type="loan"),
                stint(5, "genoa", "Genoa", "2012", "2013", appearances=34),
                stint(6, "torino", "Torino", "2013", "2014", appearances=34),
                stint(7, "bvb", "Borussia Dortmund", "2014", "2015", appearances=34),
                stint(8, "sevilla", "Sevilla", "2015", "2016", appearances=15),
                stint(9, "torino", "Torino", "2016", "2016", appearances=14, stint_type="loan"),
                stint(10, "lazio", "Lazio", "2016", "2024", appearances=340),
                stint(11, "besiktas", "Beşiktaş", "2024", None, appearances=12)
            ],
            provider_ids={"transfermarkt": "105560", "wikidata": "Q297292"},
            career_complete=False
        ),
        # 191. Mauro Icardi
        player(
            "mauro_icardi", "Mauro Icardi", "Mauro Emanuel Icardi",
            ["Icardi", "Mauro Emanuel Icardi"],
            "1993-02-19", ["Argentina", "Italy"], "active",
            [
                stint(1, "sampdoria", "Sampdoria", "2012", "2013", appearances=33),
                stint(2, "inter", "Inter Milan", "2013", "2019", appearances=219),
                stint(3, "psg", "Paris Saint-Germain", "2019", "2022", appearances=92),
                stint(4, "galatasaray", "Galatasaray", "2022", None, appearances=80)
            ],
            provider_ids={"transfermarkt": "68863", "wikidata": "Q519524"},
            career_complete=False
        ),
        # 192. Gonzalo Higuaín
        player(
            "gonzalo_higuain", "Gonzalo Higuaín", "Gonzalo Gerardo Higuaín",
            ["Higuain", "El Pipita", "Gonzalo Gerardo Higuain"],
            "1987-12-10", ["Argentina", "France"], "retired",
            [
                stint(1, "river_plate", "River Plate", "2005", "2007", appearances=41),
                stint(2, "rmcf", "Real Madrid", "2007", "2013", appearances=264),
                stint(3, "napoli", "Napoli", "2013", "2016", appearances=146),
                stint(4, "juve", "Juventus", "2016", "2018", appearances=105),
                stint(5, "acmilan", "AC Milan", "2018", "2019", appearances=22, stint_type="loan"),
                stint(6, "cfc", "Chelsea", "2019", "2019", appearances=18, stint_type="loan"),
                stint(7, "juve", "Juventus", "2019", "2020", appearances=44),
                stint(8, "inter_miami", "Inter Miami", "2020", "2022", appearances=70)
            ],
            provider_ids={"transfermarkt": "39153", "wikidata": "Q483849"},
            career_complete=True
        ),
        # 193. Radamel Falcao
        player(
            "radamel_falcao", "Radamel Falcao", "Radamel Falcao García Zárate",
            ["Falcao", "El Tigre", "Radamel Falcao Garcia Zarate"],
            "1986-02-10", ["Colombia"], "active",
            [
                stint(1, "lanceros_boyaca", "Lanceros Boyacá", "1999", "2000", appearances=8),
                stint(2, "river_plate", "River Plate", "2005", "2009", appearances=111),
                stint(3, "porto", "Porto", "2009", "2011", appearances=87),
                stint(4, "atletico", "Atlético Madrid", "2011", "2013", appearances=91),
                stint(5, "monaco", "Monaco", "2013", "2014", appearances=22),
                stint(6, "manu", "Manchester United", "2014", "2015", appearances=29, stint_type="loan"),
                stint(7, "cfc", "Chelsea", "2015", "2016", appearances=12, stint_type="loan"),
                stint(8, "monaco", "Monaco", "2016", "2019", appearances=118),
                stint(9, "galatasaray", "Galatasaray", "2019", "2021", appearances=43),
                stint(10, "rayo_vallecano", "Rayo Vallecano", "2021", "2024", appearances=80),
                stint(11, "millonarios", "Millonarios", "2024", None, appearances=6)
            ],
            provider_ids={"transfermarkt": "39152", "wikidata": "Q172586"},
            career_complete=False
        ),
        # 194. James Rodríguez
        player(
            "james_rodriguez", "James Rodríguez", "James David Rodríguez Rubio",
            ["James", "James David Rodriguez Rubio"],
            "1991-07-12", ["Colombia"], "active",
            [
                stint(1, "envigado", "Envigado", "2006", "2008", appearances=30),
                stint(2, "banfield", "Banfield", "2008", "2010", appearances=51),
                stint(3, "porto", "Porto", "2010", "2013", appearances=108),
                stint(4, "monaco", "Monaco", "2013", "2014", appearances=38),
                stint(5, "rmcf", "Real Madrid", "2014", "2017", appearances=111),
                stint(6, "bayern", "Bayern Munich", "2017", "2019", appearances=67, stint_type="loan"),
                stint(7, "rmcf", "Real Madrid", "2019", "2020", appearances=14),
                stint(8, "everton", "Everton", "2020", "2021", appearances=26),
                stint(9, "al_rayyan", "Al-Rayyan", "2021", "2022", appearances=16),
                stint(10, "olympiacos", "Olympiacos", "2022", "2023", appearances=23),
                stint(11, "sao_paulo", "São Paulo", "2023", "2024", appearances=22),
                stint(12, "rayo_vallecano", "Rayo Vallecano", "2024", None, appearances=5)
            ],
            provider_ids={"transfermarkt": "88103", "wikidata": "Q36835"},
            career_complete=False
        ),
        # 195. Arturo Vidal
        player(
            "arturo_vidal", "Arturo Vidal", "Arturo Erasmo Vidal Pardo",
            ["Vidal", "King Arturo", "Arturo Erasmo Vidal Pardo"],
            "1987-05-22", ["Chile"], "active",
            [
                stint(1, "colo_colo", "Colo-Colo", "2005", "2007", appearances=56),
                stint(2, "leverkusen", "Bayer Leverkusen", "2007", "2011", appearances=144),
                stint(3, "juve", "Juventus", "2011", "2015", appearances=171),
                stint(4, "bayern", "Bayern Munich", "2015", "2018", appearances=124),
                stint(5, "fcb", "Barcelona", "2018", "2020", appearances=96),
                stint(6, "inter", "Inter Milan", "2020", "2022", appearances=70),
                stint(7, "flamengo", "Flamengo", "2022", "2023", appearances=51),
                stint(8, "athletico_paranaense", "Athletico Paranaense", "2023", "2023", appearances=9),
                stint(9, "colo_colo", "Colo-Colo", "2024", None, appearances=25)
            ],
            provider_ids={"transfermarkt": "37666", "wikidata": "Q192875"},
            career_complete=False
        ),
        # 196. Claudio Bravo
        player(
            "claudio_bravo", "Claudio Bravo", "Claudio Andrés Bravo Muñoz",
            ["Bravo", "Claudio Andres Bravo Munoz"],
            "1983-04-13", ["Chile", "Spain"], "retired",
            [
                stint(1, "colo_colo", "Colo-Colo", "2002", "2006", appearances=133),
                stint(2, "real_sociedad", "Real Sociedad", "2006", "2014", appearances=237),
                stint(3, "fcb", "Barcelona", "2014", "2016", appearances=75),
                stint(4, "mancity", "Manchester City", "2016", "2020", appearances=61),
                stint(5, "betis", "Real Betis", "2020", "2024", appearances=74)
            ],
            provider_ids={"transfermarkt": "40422", "wikidata": "Q312492"},
            career_complete=True
        ),
        # 197. Diego Forlán
        player(
            "diego_forlan", "Diego Forlán", "Diego Forlán Corazo",
            ["Forlan", "Diego Forlan Corazo"],
            "1979-05-19", ["Uruguay"], "retired",
            [
                stint(1, "independiente", "Independiente", "1997", "2002", appearances=91),
                stint(2, "manu", "Manchester United", "2002", "2004", appearances=98),
                stint(3, "villarreal", "Villarreal", "2004", "2007", appearances=128),
                stint(4, "atletico", "Atlético Madrid", "2007", "2011", appearances=198),
                stint(5, "inter", "Inter Milan", "2011", "2012", appearances=20),
                stint(6, "internacional", "Internacional", "2012", "2013", appearances=55),
                stint(7, "cerezo_osaka", "Cerezo Osaka", "2014", "2015", appearances=45),
                stint(8, "penarol", "Peñarol", "2015", "2016", appearances=34),
                stint(9, "mumbai_city", "Mumbai City", "2016", "2016", appearances=12),
                stint(10, "kitchee", "Kitchee", "2018", "2018", appearances=23)
            ],
            provider_ids={"transfermarkt": "3408", "wikidata": "Q261534"},
            career_complete=True
        ),
        # 198. Diego Godín
        player(
            "diego_godin", "Diego Godín", "Diego Roberto Godín Leal",
            ["Godin", "Diego Roberto Godin Leal"],
            "1986-02-16", ["Uruguay", "Spain"], "retired",
            [
                stint(1, "cerro", "Cerro", "2003", "2006", appearances=64),
                stint(2, "nacional", "Nacional", "2006", "2007", appearances=46),
                stint(3, "villarreal", "Villarreal", "2007", "2010", appearances=116),
                stint(4, "atletico", "Atlético Madrid", "2010", "2019", appearances=389),
                stint(5, "inter", "Inter Milan", "2019", "2020", appearances=36),
                stint(6, "cagliari", "Cagliari", "2020", "2022", appearances=40),
                stint(7, "atletico_mineiro", "Atlético Mineiro", "2022", "2022", appearances=9),
                stint(8, "velez_sarsfield", "Vélez Sarsfield", "2022", "2023", appearances=22)
            ],
            provider_ids={"transfermarkt": "54928", "wikidata": "Q214917"},
            career_complete=True
        ),
        # 199. Bernardo Silva
        player(
            "bernardo_silva", "Bernardo Silva", "Bernardo Mota Veiga de Carvalho e Silva",
            ["Silva", "Bernardo Mota Veiga de Carvalho e Silva"],
            "1994-08-10", ["Portugal"], "active",
            [
                stint(1, "benfica", "Benfica", "2013", "2014", appearances=3),
                stint(2, "monaco", "Monaco", "2014", "2017", appearances=147),
                stint(3, "mancity", "Manchester City", "2017", None, appearances=355)
            ],
            provider_ids={"transfermarkt": "241641", "wikidata": "Q15632127"},
            career_complete=False,
            exclusions=[{"club": "Benfica B", "reason": "b-team-only", "evidence": "Played 38 matches in Segunda Liga 2013-14 before loan to Monaco."}]
        ),
        # 200. Bruno Fernandes
        player(
            "bruno_fernandes", "Bruno Fernandes", "Bruno Miguel Borges Fernandes",
            ["Fernandes", "Bruno Miguel Borges Fernandes"],
            "1994-09-08", ["Portugal"], "active",
            [
                stint(1, "novara", "Novara", "2012", "2013", appearances=23),
                stint(2, "udinese", "Udinese", "2013", "2016", appearances=95),
                stint(3, "sampdoria", "Sampdoria", "2016", "2017", appearances=35),
                stint(4, "sporting", "Sporting CP", "2017", "2020", appearances=137),
                stint(5, "manu", "Manchester United", "2020", None, appearances=233)
            ],
            provider_ids={"transfermarkt": "240306", "wikidata": "Q3645749"},
            career_complete=False
        ),
        # 201. Martin Ødegaard
        player(
            "martin_odegaard", "Martin Ødegaard", "Martin Ødegaard",
            ["Odegaard", "Martin Odegaard"],
            "1998-12-17", ["Norway"], "active",
            [
                stint(1, "stromsgodset", "Strømsgodset", "2014", "2015", appearances=25),
                stint(2, "rmcf", "Real Madrid", "2015", "2017", appearances=2),
                stint(3, "heerenveen", "Heerenveen", "2017", "2018", appearances=43, stint_type="loan"),
                stint(4, "vitesse", "Vitesse", "2018", "2019", appearances=39, stint_type="loan"),
                stint(5, "real_sociedad", "Real Sociedad", "2019", "2020", appearances=36, stint_type="loan"),
                stint(6, "rmcf", "Real Madrid", "2020", "2021", appearances=9),
                stint(7, "afc", "Arsenal", "2021", None, appearances=155)
            ],
            provider_ids={"transfermarkt": "316264", "wikidata": "Q16744046"},
            career_complete=False,
            exclusions=[{"club": "Real Madrid Castilla", "reason": "b-team-only", "evidence": "Played 62 matches in Segunda B 2015-2017; first team debut was 23 May 2015 vs Getafe."}]
        ),
        # 202. Christian Eriksen
        player(
            "christian_eriksen", "Christian Eriksen", "Christian Dannemann Eriksen",
            ["Eriksen", "Christian Dannemann Eriksen"],
            "1992-02-14", ["Denmark"], "active",
            [
                stint(1, "ajax", "Ajax", "2010", "2013", appearances=162),
                stint(2, "tottenham", "Tottenham Hotspur", "2013", "2020", appearances=305),
                stint(3, "inter", "Inter Milan", "2020", "2021", appearances=60),
                stint(4, "brentford", "Brentford", "2022", "2022", appearances=11),
                stint(5, "manu", "Manchester United", "2022", None, appearances=72)
            ],
            provider_ids={"transfermarkt": "69633", "wikidata": "Q29534"},
            career_complete=False
        ),
        # 203. Frenkie de Jong
        player(
            "frenkie_de_jong", "Frenkie de Jong", "Frenkie de Jong",
            ["De Jong", "Frenkie"],
            "1997-05-12", ["Netherlands"], "active",
            [
                stint(1, "willem_ii", "Willem II", "2015", "2015", appearances=3),
                stint(2, "ajax", "Ajax", "2016", "2019", appearances=89),
                stint(3, "fcb", "Barcelona", "2019", None, appearances=213)
            ],
            provider_ids={"transfermarkt": "326330", "wikidata": "Q19882858"},
            career_complete=False,
            exclusions=[{"club": "Jong Ajax", "reason": "b-team-only", "evidence": "Played 46 matches in Eerste Divisie 2015-2017 before first-team establishment."}]
        ),
        # 204. Matthijs de Ligt
        player(
            "matthijs_de_ligt", "Matthijs de Ligt", "Matthijs de Ligt",
            ["De Ligt", "Matthijs"],
            "1999-08-12", ["Netherlands"], "active",
            [
                stint(1, "ajax", "Ajax", "2016", "2019", appearances=117),
                stint(2, "juve", "Juventus", "2019", "2022", appearances=117),
                stint(3, "bayern", "Bayern Munich", "2022", "2024", appearances=73),
                stint(4, "manu", "Manchester United", "2024", None, appearances=8)
            ],
            provider_ids={"transfermarkt": "326031", "wikidata": "Q26259982"},
            career_complete=False,
            exclusions=[{"club": "Jong Ajax", "reason": "b-team-only", "evidence": "Played 17 matches in Eerste Divisie 2016-17; first team debut on 21 Sept 2016 vs Willem II."}]
        ),
        # 205. Achraf Hakimi
        player(
            "achraf_hakimi", "Achraf Hakimi", "Achraf Hakimi Mouh",
            ["Hakimi", "Achraf Hakimi Mouh"],
            "1998-11-04", ["Morocco", "Spain"], "active",
            [
                stint(1, "rmcf", "Real Madrid", "2017", "2018", appearances=17),
                stint(2, "bvb", "Borussia Dortmund", "2018", "2020", appearances=73, stint_type="loan"),
                stint(3, "inter", "Inter Milan", "2020", "2021", appearances=45),
                stint(4, "psg", "Paris Saint-Germain", "2021", None, appearances=120)
            ],
            provider_ids={"transfermarkt": "398073", "wikidata": "Q26932451"},
            career_complete=False,
            exclusions=[{"club": "Real Madrid Castilla", "reason": "b-team-only", "evidence": "Played 28 matches in Segunda B 2016-17 before promotion to first team."}]
        ),
        # 206. João Cancelo
        player(
            "joao_cancelo", "João Cancelo", "João Pedro Cavaco Cancelo",
            ["Cancelo", "Joao Cancelo", "Joao Pedro Cavaco Cancelo"],
            "1994-05-27", ["Portugal"], "active",
            [
                stint(1, "benfica", "Benfica", "2014", "2014", appearances=2),
                stint(2, "valencia", "Valencia", "2014", "2017", appearances=91),
                stint(3, "inter", "Inter Milan", "2017", "2018", appearances=28, stint_type="loan"),
                stint(4, "juve", "Juventus", "2018", "2019", appearances=34),
                stint(5, "mancity", "Manchester City", "2019", "2023", appearances=154),
                stint(6, "bayern", "Bayern Munich", "2023", "2023", appearances=21, stint_type="loan"),
                stint(7, "fcb", "Barcelona", "2023", "2024", appearances=42, stint_type="loan"),
                stint(8, "al_hilal", "Al-Hilal", "2024", None, appearances=6)
            ],
            provider_ids={"transfermarkt": "182712", "wikidata": "Q6298086"},
            career_complete=False,
            exclusions=[{"club": "Benfica B", "reason": "b-team-only", "evidence": "Played 51 matches in Segunda Liga 2012-2014 before loan to Valencia."}]
        ),
        # 207. Riyad Mahrez
        player(
            "riyad_mahrez", "Riyad Mahrez", "Riyad Karim Mahrez",
            ["Mahrez", "Riyad Karim Mahrez"],
            "1991-02-21", ["Algeria", "France"], "active",
            [
                stint(1, "quimper", "Quimper", "2009", "2010", appearances=27),
                stint(2, "le_havre", "Le Havre", "2011", "2014", appearances=67),
                stint(3, "leicester", "Leicester City", "2014", "2018", appearances=179),
                stint(4, "mancity", "Manchester City", "2018", "2023", appearances=236),
                stint(5, "al_ahli", "Al-Ahli", "2023", None, appearances=36)
            ],
            provider_ids={"transfermarkt": "171424", "wikidata": "Q13054101"},
            career_complete=False,
            exclusions=[{"club": "Le Havre II", "reason": "b-team-only", "evidence": "Played 60 matches in CFA 2010-2013 alongside first team."}]
        ),
        # 208. Hakim Ziyech
        player(
            "hakim_ziyech", "Hakim Ziyech", "Hakim Ziyech",
            ["Ziyech", "The Wizard"],
            "1993-03-19", ["Morocco", "Netherlands"], "active",
            [
                stint(1, "heerenveen", "Heerenveen", "2012", "2014", appearances=46),
                stint(2, "twente", "FC Twente", "2014", "2016", appearances=76),
                stint(3, "ajax", "Ajax", "2016", "2020", appearances=165),
                stint(4, "cfc", "Chelsea", "2020", "2023", appearances=107),
                stint(5, "galatasaray", "Galatasaray", "2023", None, appearances=27)
            ],
            provider_ids={"transfermarkt": "217111", "wikidata": "Q335454"},
            career_complete=False
        ),
        # 209. Kalidou Koulibaly
        player(
            "kalidou_koulibaly", "Kalidou Koulibaly", "Kalidou Koulibaly",
            ["Koulibaly"],
            "1991-06-20", ["Senegal", "France"], "active",
            [
                stint(1, "metz", "Metz", "2010", "2012", appearances=46),
                stint(2, "genk", "Genk", "2012", "2014", appearances=92),
                stint(3, "napoli", "Napoli", "2014", "2022", appearances=317),
                stint(4, "cfc", "Chelsea", "2022", "2023", appearances=32),
                stint(5, "al_hilal", "Al-Hilal", "2023", None, appearances=47)
            ],
            provider_ids={"transfermarkt": "93103", "wikidata": "Q1721998"},
            career_complete=False,
            exclusions=[{"club": "Metz II", "reason": "b-team-only", "evidence": "Played in CFA 2009-2011 before senior first team establishment."}]
        ),
        # 210. Memphis Depay
        player(
            "memphis_depay", "Memphis Depay", "Memphis Depay",
            ["Memphis", "Memphis Depay"],
            "1994-02-13", ["Netherlands"], "active",
            [
                stint(1, "psv", "PSV Eindhoven", "2011", "2015", appearances=124),
                stint(2, "manu", "Manchester United", "2015", "2017", appearances=53),
                stint(3, "lyon", "Lyon", "2017", "2021", appearances=178),
                stint(4, "fcb", "Barcelona", "2021", "2023", appearances=42),
                stint(5, "atletico", "Atlético Madrid", "2023", "2024", appearances=40),
                stint(6, "corinthians", "Corinthians", "2024", None, appearances=6)
            ],
            provider_ids={"transfermarkt": "167850", "wikidata": "Q701389"},
            career_complete=False
        )
    ]
    
    assert len(players) == 90, f"Expected 90 players in batch 2, got {len(players)}"
    return players

if __name__ == "__main__":
    p = generate()
    print(f"Batch 2 successfully generated: {len(p)} players.")

