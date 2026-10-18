"""
Generator script for Journeyman Player Data Batch 1 (Players 1 to 100).
Includes audited 20 seed players and 80 world-renowned legends & historical icons.
"""
import json
import os

def generate():
    from player_builder_helpers import player, stint
    
    players = [
        # --- Audited 20 Seed Players ---
        player(
            "cristiano_ronaldo", "Cristiano Ronaldo", "Cristiano Ronaldo dos Santos Aveiro",
            ["Ronaldo", "CR7", "Cristiano", "Cristiano Ronaldo dos Santos Aveiro"],
            "1985-02-05", ["Portugal"], "active",
            [
                stint(1, "sporting", "Sporting CP", "2002", "2003", appearances=31),
                stint(2, "manu", "Manchester United", "2003", "2009", appearances=292),
                stint(3, "rmcf", "Real Madrid", "2009", "2018", appearances=438),
                stint(4, "juve", "Juventus", "2018", "2021", appearances=134),
                stint(5, "manu", "Manchester United", "2021", "2022", appearances=54),
                stint(6, "al_nassr", "Al Nassr", "2023", None, appearances=74)
            ],
            provider_ids={"transfermarkt": "8198", "wikidata": "Q11571"},
            career_complete=False,
            exclusions=[{"club": "Sporting CP B", "reason": "b-team-only", "evidence": "Played 2 matches for Sporting CP B in Segunda Divisão B; senior debut was for Sporting first team vs Inter Milan 14 Aug 2002."}]
        ),
        player(
            "zlatan_ibrahimovic", "Zlatan Ibrahimović", "Zlatan Ibrahimović",
            ["Zlatan", "Ibrahimovic", "Ibra"],
            "1981-10-03", ["Sweden"], "retired",
            [
                stint(1, "malmo_ff", "Malmö FF", "1999", "2001", appearances=47),
                stint(2, "ajax", "Ajax", "2001", "2004", appearances=110),
                stint(3, "juve", "Juventus", "2004", "2006", appearances=92),
                stint(4, "inter", "Inter Milan", "2006", "2009", appearances=117),
                stint(5, "fcb", "Barcelona", "2009", "2010", appearances=45),
                stint(6, "acmilan", "AC Milan", "2010", "2012", appearances=85, stint_type="loan"),
                stint(7, "psg", "Paris Saint-Germain", "2012", "2016", appearances=180),
                stint(8, "manu", "Manchester United", "2016", "2018", appearances=53),
                stint(9, "la_galaxy", "LA Galaxy", "2018", "2019", appearances=58),
                stint(10, "acmilan", "AC Milan", "2020", "2023", appearances=78)
            ],
            provider_ids={"transfermarkt": "3455", "wikidata": "Q468962"}
        ),
        player(
            "angel_di_maria", "Ángel Di María", "Ángel Fabián Di María",
            ["Di Maria", "Angel Di Maria", "El Fideo"],
            "1988-02-14", ["Argentina"], "active",
            [
                stint(1, "rosario_central", "Rosario Central", "2005", "2007", appearances=39),
                stint(2, "benfica", "Benfica", "2007", "2010", appearances=121),
                stint(3, "rmcf", "Real Madrid", "2010", "2014", appearances=190),
                stint(4, "manu", "Manchester United", "2014", "2015", appearances=32),
                stint(5, "psg", "Paris Saint-Germain", "2015", "2022", appearances=295),
                stint(6, "juve", "Juventus", "2022", "2023", appearances=40),
                stint(7, "benfica", "Benfica", "2023", None, appearances=50)
            ],
            provider_ids={"transfermarkt": "45320", "wikidata": "Q2516"},
            career_complete=False
        ),
        player(
            "cesc_fabregas", "Cesc Fàbregas", "Francesc Fàbregas Soler",
            ["Fabregas", "Cesc", "Francesc Fabregas"],
            "1987-05-04", ["Spain"], "retired",
            [
                stint(1, "afc", "Arsenal", "2003", "2011", appearances=303),
                stint(2, "fcb", "Barcelona", "2011", "2014", appearances=151),
                stint(3, "cfc", "Chelsea", "2014", "2019", appearances=198),
                stint(4, "monaco", "Monaco", "2019", "2022", appearances=68),
                stint(5, "como", "Como", "2022", "2023", appearances=17)
            ],
            provider_ids={"transfermarkt": "8806", "wikidata": "Q17499"},
            exclusions=[
                {"club": "Barcelona Youth", "reason": "youth-academy", "evidence": "At La Masia 1997-2003; senior professional debut made at Arsenal on 28 Oct 2003 vs Rotherham United."},
                {"club": "Monaco B", "reason": "b-team-only", "evidence": "Appeared in 1 match for Monaco B during injury recovery in 2022."}
            ]
        ),
        player(
            "fernando_torres", "Fernando Torres", "Fernando José Torres Sanz",
            ["Torres", "El Nino", "Fernando Jose Torres Sanz"],
            "1984-03-20", ["Spain"], "retired",
            [
                stint(1, "atletico", "Atlético Madrid", "2001", "2007", appearances=244),
                stint(2, "lfc", "Liverpool", "2007", "2011", appearances=142),
                stint(3, "cfc", "Chelsea", "2011", "2014", appearances=172),
                stint(4, "acmilan", "AC Milan", "2014", "2015", appearances=10, stint_type="loan"),
                stint(5, "atletico", "Atlético Madrid", "2015", "2018", appearances=160),
                stint(6, "sagan_tosu", "Sagan Tosu", "2018", "2019", appearances=40)
            ],
            provider_ids={"transfermarkt": "7724", "wikidata": "Q42731"}
        ),
        player(
            "alvaro_morata", "Álvaro Morata", "Álvaro Borja Morata Martín",
            ["Morata", "Alvaro Borja Morata"],
            "1992-10-23", ["Spain"], "active",
            [
                stint(1, "rmcf", "Real Madrid", "2010", "2014", appearances=52),
                stint(2, "juve", "Juventus", "2014", "2016", appearances=93),
                stint(3, "rmcf", "Real Madrid", "2016", "2017", appearances=43),
                stint(4, "cfc", "Chelsea", "2017", "2019", appearances=72),
                stint(5, "atletico", "Atlético Madrid", "2019", "2020", appearances=61),
                stint(6, "juve", "Juventus", "2020", "2022", appearances=92, stint_type="loan"),
                stint(7, "atletico", "Atlético Madrid", "2022", "2024", appearances=93),
                stint(8, "acmilan", "AC Milan", "2024", None, appearances=10)
            ],
            provider_ids={"transfermarkt": "128223", "wikidata": "Q17466"},
            career_complete=False,
            exclusions=[
                {"club": "Galatasaray", "reason": "administrative-return", "evidence": "Seed data erroneously listed Galatasaray; Morata never transferred to or played for Galatasaray."},
                {"club": "Real Madrid Castilla", "reason": "b-team-only", "evidence": "Played for Real Madrid Castilla reserve team; first team debut 12 Dec 2010 vs Real Zaragoza."}
            ]
        ),
        player(
            "robert_lewandowski", "Robert Lewandowski", "Robert Lewandowski",
            ["Lewandowski", "Lewy", "Lewa"],
            "1988-08-21", ["Poland"], "active",
            [
                stint(1, "znicz_pruszkow", "Znicz Pruszków", "2006", "2008", appearances=66),
                stint(2, "lech_poznan", "Lech Poznań", "2008", "2010", appearances=82),
                stint(3, "bvb", "Borussia Dortmund", "2010", "2014", appearances=187),
                stint(4, "bayern", "Bayern Munich", "2014", "2022", appearances=375),
                stint(5, "fcb", "Barcelona", "2022", None, appearances=100)
            ],
            provider_ids={"transfermarkt": "38253", "wikidata": "Q1512"},
            career_complete=False,
            exclusions=[
                {"club": "Delta Warsaw", "reason": "trial-or-friendly-only", "evidence": "Amateur fourth-tier regional appearances prior to professional breakthrough."},
                {"club": "Legia Warsaw II", "reason": "b-team-only", "evidence": "Reserve team in third division."}
            ]
        ),
        player(
            "toni_kroos", "Toni Kroos", "Toni Kroos",
            ["Kroos"],
            "1990-01-04", ["Germany"], "retired",
            [
                stint(1, "bayern", "Bayern Munich", "2007", "2009", appearances=27),
                stint(2, "leverkusen", "Bayer Leverkusen", "2009", "2010", appearances=48, stint_type="loan"),
                stint(3, "bayern", "Bayern Munich", "2010", "2014", appearances=178),
                stint(4, "rmcf", "Real Madrid", "2014", "2024", appearances=465)
            ],
            provider_ids={"transfermarkt": "31909", "wikidata": "Q131714"},
            exclusions=[
                {"club": "Hansa Rostock", "reason": "youth-academy", "evidence": "Seed data listed Hansa Rostock. Kroos was in Rostock youth teams (2002-2006) and never played a senior competitive first-team match. Professional debut was for Bayern Munich on 26 Sep 2007 vs Energie Cottbus."}
            ]
        ),
        player(
            "joao_felix", "João Félix", "João Félix Sequeira",
            ["Joao Felix", "Felix"],
            "1999-11-10", ["Portugal"], "active",
            [
                stint(1, "benfica", "Benfica", "2018", "2019", appearances=43),
                stint(2, "atletico", "Atlético Madrid", "2019", "2023", appearances=131),
                stint(3, "cfc", "Chelsea", "2023", "2023", appearances=20, stint_type="loan"),
                stint(4, "fcb", "Barcelona", "2023", "2024", appearances=44, stint_type="loan"),
                stint(5, "cfc", "Chelsea", "2024", None, appearances=10)
            ],
            provider_ids={"transfermarkt": "462250", "wikidata": "Q56247926"},
            career_complete=False,
            exclusions=[
                {"club": "AC Milan", "reason": "administrative-return", "evidence": "Seed data erroneously listed AC Milan; Joao Felix has never played for AC Milan."},
                {"club": "Benfica B", "reason": "b-team-only", "evidence": "Played for Benfica B in LigaPro; first team debut 18 Aug 2018 vs Boavista."}
            ]
        ),
        player(
            "antoine_griezmann", "Antoine Griezmann", "Antoine Griezmann",
            ["Griezmann", "Grizou"],
            "1991-03-21", ["France"], "active",
            [
                stint(1, "real_sociedad", "Real Sociedad", "2009", "2014", appearances=202),
                stint(2, "atletico", "Atlético Madrid", "2014", "2019", appearances=257),
                stint(3, "fcb", "Barcelona", "2019", "2021", appearances=102),
                stint(4, "atletico", "Atlético Madrid", "2021", None, appearances=145)
            ],
            provider_ids={"transfermarkt": "125781", "wikidata": "Q456436"},
            career_complete=False
        ),
        player(
            "mats_hummels", "Mats Hummels", "Mats Julian Hummels",
            ["Hummels", "Mats Julian Hummels"],
            "1988-12-16", ["Germany"], "active",
            [
                stint(1, "bayern", "Bayern Munich", "2007", "2008", appearances=2),
                stint(2, "bvb", "Borussia Dortmund", "2008", "2016", appearances=309),
                stint(3, "bayern", "Bayern Munich", "2016", "2019", appearances=116),
                stint(4, "bvb", "Borussia Dortmund", "2019", "2024", appearances=199),
                stint(5, "asroma", "Roma", "2024", None, appearances=5)
            ],
            provider_ids={"transfermarkt": "39728", "wikidata": "Q105650"},
            career_complete=False,
            exclusions=[{"club": "Bayern Munich II", "reason": "b-team-only", "evidence": "Played 42 games for Bayern II in Regionalliga."}]
        ),
        player(
            "mario_gotze", "Mario Götze", "Mario Götze",
            ["Gotze", "Goetze", "Mario Goetze"],
            "1992-06-03", ["Germany"], "active",
            [
                stint(1, "bvb", "Borussia Dortmund", "2009", "2013", appearances=116),
                stint(2, "bayern", "Bayern Munich", "2013", "2016", appearances=114),
                stint(3, "bvb", "Borussia Dortmund", "2016", "2020", appearances=103),
                stint(4, "psv_eindhoven", "PSV Eindhoven", "2020", "2022", appearances=77),
                stint(5, "frankfruit", "Eintracht Frankfurt", "2022", None, appearances=80)
            ],
            provider_ids={"transfermarkt": "74842", "wikidata": "Q104454"},
            career_complete=False
        ),
        player(
            "arjen_robben", "Arjen Robben", "Arjen Robben",
            ["Robben"],
            "1984-01-23", ["Netherlands"], "retired",
            [
                stint(1, "groningen", "FC Groningen", "2000", "2002", appearances=52),
                stint(2, "psv_eindhoven", "PSV Eindhoven", "2002", "2004", appearances=75),
                stint(3, "cfc", "Chelsea", "2004", "2007", appearances=106),
                stint(4, "rmcf", "Real Madrid", "2007", "2009", appearances=65),
                stint(5, "bayern", "Bayern Munich", "2009", "2019", appearances=309),
                stint(6, "groningen", "FC Groningen", "2020", "2021", appearances=7)
            ],
            provider_ids={"transfermarkt": "4360", "wikidata": "Q43913"},
            conflict_resolutions=[{"stintOrFact": "Second Groningen stint", "sourcesExamined": ["FC Groningen official", "Transfermarkt"], "resolution": "Robben came out of retirement in June 2020 and played 7 competitive Eredivisie matches for Groningen in 2020-21 before re-retiring."}]
        ),
        player(
            "owen_hargreaves", "Owen Hargreaves", "Owen Lee Hargreaves",
            ["Hargreaves"],
            "1981-01-20", ["England"], "retired",
            [
                stint(1, "bayern", "Bayern Munich", "2000", "2007", appearances=218),
                stint(2, "manu", "Manchester United", "2007", "2011", appearances=39),
                stint(3, "mancity", "Manchester City", "2011", "2012", appearances=4)
            ],
            provider_ids={"transfermarkt": "203", "wikidata": "Q203405"},
            exclusions=[{"club": "Bayern Munich II", "reason": "b-team-only", "evidence": "Played for Bayern II in Regionalliga Süd 1999-2001."}]
        ),
        player(
            "jadon_sancho", "Jadon Sancho", "Jadon Malik Sancho",
            ["Sancho"],
            "2000-03-25", ["England"], "active",
            [
                stint(1, "bvb", "Borussia Dortmund", "2017", "2021", appearances=137),
                stint(2, "manu", "Manchester United", "2021", "2024", appearances=83),
                stint(3, "bvb", "Borussia Dortmund", "2024", "2024", appearances=21, stint_type="loan"),
                stint(4, "cfc", "Chelsea", "2024", None, appearances=8, stint_type="loan")
            ],
            provider_ids={"transfermarkt": "401173", "wikidata": "Q29965077"},
            career_complete=False,
            exclusions=[
                {"club": "Watford", "reason": "youth-academy", "evidence": "Seed data listed Watford. Sancho was in Watford youth academy (2007-2015), 0 senior first team appearances."},
                {"club": "Manchester City", "reason": "youth-academy", "evidence": "Seed data listed Man City. Sancho was in City youth academy (2015-2017), 0 senior first team appearances. Senior debut was for Dortmund 21 Oct 2017 vs Eintracht Frankfurt."}
            ]
        ),
        player(
            "neymar", "Neymar", "Neymar da Silva Santos Júnior",
            ["Neymar Jr", "Ney", "Neymar da Silva Santos Junior"],
            "1992-02-05", ["Brazil"], "active",
            [
                stint(1, "santos", "Santos", "2009", "2013", appearances=225),
                stint(2, "fcb", "Barcelona", "2013", "2017", appearances=186),
                stint(3, "psg", "Paris Saint-Germain", "2017", "2023", appearances=173),
                stint(4, "al_hilal", "Al Hilal", "2023", None, appearances=5)
            ],
            provider_ids={"transfermarkt": "68290", "wikidata": "Q142794"},
            career_complete=False
        ),
        player(
            "david_alaba", "David Alaba", "David Olatukunbo Alaba",
            ["Alaba", "David Olatukunbo Alaba"],
            "1992-06-24", ["Austria"], "active",
            [
                stint(1, "austria_vienna", "Austria Wien", "2008", "2008", appearances=1),
                stint(2, "bayern", "Bayern Munich", "2010", "2011", appearances=19),
                stint(3, "hoffenheim", "1899 Hoffenheim", "2011", "2011", appearances=18, stint_type="loan"),
                stint(4, "bayern", "Bayern Munich", "2011", "2021", appearances=412),
                stint(5, "rmcf", "Real Madrid", "2021", None, appearances=102)
            ],
            provider_ids={"transfermarkt": "59016", "wikidata": "Q164746"},
            career_complete=False
        ),
        player(
            "xabi_alonso", "Xabi Alonso", "Xabier Alonso Olano",
            ["Xabi", "Xabi Alonso Olano"],
            "1981-11-25", ["Spain"], "retired",
            [
                stint(1, "real_sociedad", "Real Sociedad", "1999", "2000", appearances=1),
                stint(2, "eibar", "Eibar", "2000", "2001", appearances=14, stint_type="loan"),
                stint(3, "real_sociedad", "Real Sociedad", "2001", "2004", appearances=123),
                stint(4, "lfc", "Liverpool", "2004", "2009", appearances=210),
                stint(5, "rmcf", "Real Madrid", "2009", "2014", appearances=236),
                stint(6, "bayern", "Bayern Munich", "2014", "2017", appearances=117)
            ],
            provider_ids={"transfermarkt": "7476", "wikidata": "Q182889"}
        ),
        player(
            "david_beckham", "David Beckham", "David Robert Joseph Beckham",
            ["Beckham", "Becks", "David Robert Joseph Beckham"],
            "1975-05-02", ["England"], "retired",
            [
                stint(1, "manu", "Manchester United", "1992", "1994", appearances=2),
                stint(2, "preston_north_end", "Preston North End", "1995", "1995", appearances=5, stint_type="loan"),
                stint(3, "manu", "Manchester United", "1995", "2003", appearances=392),
                stint(4, "rmcf", "Real Madrid", "2003", "2007", appearances=159),
                stint(5, "la_galaxy", "LA Galaxy", "2007", "2008", appearances=32),
                stint(6, "acmilan", "AC Milan", "2009", "2009", appearances=20, stint_type="loan"),
                stint(7, "la_galaxy", "LA Galaxy", "2009", "2009", appearances=15),
                stint(8, "acmilan", "AC Milan", "2010", "2010", appearances=13, stint_type="loan"),
                stint(9, "la_galaxy", "LA Galaxy", "2010", "2012", appearances=71),
                stint(10, "psg", "Paris Saint-Germain", "2013", "2013", appearances=14)
            ],
            provider_ids={"transfermarkt": "3139", "wikidata": "Q10520"},
            conflict_resolutions=[{"stintOrFact": "Preston North End loan", "sourcesExamined": ["Preston North End FC archives", "English Football League logs"], "resolution": "Beckham played 5 league matches and scored 2 goals on loan for Preston in Feb-March 1995 before returning to Man Utd."}]
        ),
        player(
            "thierry_henry", "Thierry Henry", "Thierry Daniel Henry",
            ["Henry", "King Henry", "Thierry Daniel Henry"],
            "1977-08-17", ["France"], "retired",
            [
                stint(1, "monaco", "Monaco", "1994", "1999", appearances=141),
                stint(2, "juve", "Juventus", "1999", "1999", appearances=19),
                stint(3, "afc", "Arsenal", "1999", "2007", appearances=369),
                stint(4, "fcb", "Barcelona", "2007", "2010", appearances=121),
                stint(5, "new_york_red_bulls", "New York Red Bulls", "2010", "2011", appearances=40),
                stint(6, "afc", "Arsenal", "2012", "2012", appearances=7, stint_type="loan"),
                stint(7, "new_york_red_bulls", "New York Red Bulls", "2012", "2014", appearances=95)
            ],
            provider_ids={"transfermarkt": "3207", "wikidata": "Q45901"},
            conflict_resolutions=[{"stintOrFact": "Arsenal 2012 return", "sourcesExamined": ["Arsenal FC official", "Premier League records"], "resolution": "Henry returned to Arsenal on a two-month loan in Jan-Feb 2012, playing 7 matches and scoring 2 goals (including famous FA Cup winner vs Leeds)."}]
        ),

        # --- Legends & Historical Greats (Players 21 to 100) ---
        player(
            "lionel_messi", "Lionel Messi", "Lionel Andrés Messi",
            ["Messi", "Leo Messi", "Lionel Andres Messi", "La Pulga"],
            "1987-06-24", ["Argentina"], "active",
            [
                stint(1, "fcb", "Barcelona", "2004", "2021", appearances=778),
                stint(2, "psg", "Paris Saint-Germain", "2021", "2023", appearances=75),
                stint(3, "inter_miami", "Inter Miami", "2023", None, appearances=39)
            ],
            provider_ids={"transfermarkt": "28003", "wikidata": "Q615"},
            career_complete=False,
            exclusions=[{"club": "Barcelona C & B", "reason": "b-team-only", "evidence": "Played for Barcelona C (2003-04) and Barcelona B (2004-05) before permanent first-team promotion; senior debut 16 Oct 2004 vs Espanyol."}]
        ),
        player(
            "pele", "Pelé", "Edson Arantes do Nascimento",
            ["Pele", "Edson Arantes do Nascimento", "O Rei"],
            "1940-10-23", ["Brazil"], "deceased",
            [
                stint(1, "santos", "Santos", "1956", "1974", appearances=659),
                stint(2, "new_york_cosmos", "New York Cosmos", "1975", "1977", appearances=107)
            ],
            provider_ids={"transfermarkt": "34484", "wikidata": "Q10524"},
            exclusions=[{"club": "Bauru AC", "reason": "youth-academy", "evidence": "Youth team (1953-1956); senior debut was with Santos on 7 Sep 1956 vs Corinthians Santo André."}]
        ),
        player(
            "diego_maradona", "Diego Maradona", "Diego Armando Maradona",
            ["Maradona", "Diego Armando Maradona", "El Pibe de Oro"],
            "1960-10-30", ["Argentina"], "deceased",
            [
                stint(1, "argentinos_juniors", "Argentinos Juniors", "1976", "1981", appearances=166),
                stint(2, "boca_juniors", "Boca Juniors", "1981", "1982", appearances=40),
                stint(3, "fcb", "Barcelona", "1982", "1984", appearances=58),
                stint(4, "napoli", "Napoli", "1984", "1991", appearances=259),
                stint(5, "sevilla", "Sevilla", "1992", "1993", appearances=29),
                stint(6, "newells_old_boys", "Newell's Old Boys", "1993", "1994", appearances=5),
                stint(7, "boca_juniors", "Boca Juniors", "1995", "1997", appearances=31)
            ],
            provider_ids={"transfermarkt": "8024", "wikidata": "Q10531"}
        ),
        player(
            "johan_cruyff", "Johan Cruyff", "Hendrik Johannes Cruijff",
            ["Cruyff", "Johan Cruijff", "Hendrik Johannes Cruijff"],
            "1947-04-25", ["Netherlands"], "deceased",
            [
                stint(1, "ajax", "Ajax", "1964", "1973", appearances=329),
                stint(2, "fcb", "Barcelona", "1973", "1978", appearances=180),
                stint(3, "los_angeles_aztecs", "Los Angeles Aztecs", "1979", "1979", appearances=27),
                stint(4, "washington_diplomats", "Washington Diplomats", "1980", "1981", appearances=32),
                stint(5, "levante", "Levante", "1981", "1981", appearances=10),
                stint(6, "ajax", "Ajax", "1981", "1983", appearances=46),
                stint(7, "feyenoord", "Feyenoord", "1983", "1984", appearances=44)
            ],
            provider_ids={"transfermarkt": "8021", "wikidata": "Q857"}
        ),
        player(
            "zinedine_zidane", "Zinedine Zidane", "Zinédine Yazid Zidane",
            ["Zidane", "Zizou", "Zinedine Yazid Zidane"],
            "1972-06-23", ["France"], "retired",
            [
                stint(1, "cannes", "Cannes", "1989", "1992", appearances=71),
                stint(2, "bordeaux", "Bordeaux", "1992", "1996", appearances=179),
                stint(3, "juve", "Juventus", "1996", "2001", appearances=212),
                stint(4, "rmcf", "Real Madrid", "2001", "2006", appearances=227)
            ],
            provider_ids={"transfermarkt": "3111", "wikidata": "Q1835"}
        ),
        player(
            "ronaldinho", "Ronaldinho", "Ronaldo de Assis Moreira",
            ["Ronaldinho Gaucho", "Ronaldo de Assis Moreira", "Dinho"],
            "1980-03-21", ["Brazil"], "retired",
            [
                stint(1, "gremio", "Grêmio", "1998", "2001", appearances=121),
                stint(2, "psg", "Paris Saint-Germain", "2001", "2003", appearances=77),
                stint(3, "fcb", "Barcelona", "2003", "2008", appearances=207),
                stint(4, "acmilan", "AC Milan", "2008", "2011", appearances=95),
                stint(5, "flamengo", "Flamengo", "2011", "2012", appearances=72),
                stint(6, "atletico_mineiro", "Atlético Mineiro", "2012", "2014", appearances=85),
                stint(7, "queretaro", "Querétaro", "2014", "2015", appearances=29),
                stint(8, "fluminense", "Fluminense", "2015", "2015", appearances=9)
            ],
            provider_ids={"transfermarkt": "3373", "wikidata": "Q3844"}
        ),
        player(
            "ronaldo_nazario", "Ronaldo Nazário", "Ronaldo Luís Nazário de Lima",
            ["Ronaldo", "Ronaldo Nazario", "R9", "O Fenomeno", "Ronaldo Luis Nazario de Lima"],
            "1976-09-18", ["Brazil"], "retired",
            [
                stint(1, "cruzeiro", "Cruzeiro", "1993", "1994", appearances=47),
                stint(2, "psv_eindhoven", "PSV Eindhoven", "1994", "1996", appearances=57),
                stint(3, "fcb", "Barcelona", "1996", "1997", appearances=49),
                stint(4, "inter", "Inter Milan", "1997", "2002", appearances=99),
                stint(5, "rmcf", "Real Madrid", "2002", "2007", appearances=177),
                stint(6, "acmilan", "AC Milan", "2007", "2008", appearances=20),
                stint(7, "corinthians", "Corinthians", "2009", "2011", appearances=69)
            ],
            provider_ids={"transfermarkt": "3140", "wikidata": "Q5292"},
            conflict_resolutions=[{"stintOrFact": "Identity separation from Cristiano Ronaldo", "sourcesExamined": ["FIFA Archives", "CBF", "Transfermarkt"], "resolution": "Ronaldo Nazário (born 18 Sep 1976 Rio de Janeiro) played for Cruzeiro, PSV, Barcelona, Inter, Real Madrid, Milan, Corinthians; distinct from Cristiano Ronaldo (born 1985 Madeira)."}]
        ),
        player(
            "rivaldo", "Rivaldo", "Rivaldo Vítor Borba Ferreira",
            ["Rivaldo Vitor Borba Ferreira"],
            "1972-04-19", ["Brazil"], "retired",
            [
                stint(1, "santa_cruz", "Santa Cruz", "1991", "1992", appearances=26),
                stint(2, "mogi_mirim", "Mogi Mirim", "1992", "1993", appearances=31),
                stint(3, "corinthians", "Corinthians", "1993", "1994", appearances=41, stint_type="loan"),
                stint(4, "palmeiras", "Palmeiras", "1994", "1996", appearances=86),
                stint(5, "deportivo_la_coruna", "Deportivo La Coruña", "1996", "1997", appearances=46),
                stint(6, "fcb", "Barcelona", "1997", "2002", appearances=235),
                stint(7, "acmilan", "AC Milan", "2002", "2003", appearances=40),
                stint(8, "cruzeiro", "Cruzeiro", "2004", "2004", appearances=11),
                stint(9, "olympiacos", "Olympiacos", "2004", "2007", appearances=95),
                stint(10, "aek_athens", "AEK Athens", "2007", "2008", appearances=44),
                stint(11, "bunyodkor", "Bunyodkor", "2008", "2010", appearances=77),
                stint(12, "sao_paulo", "São Paulo", "2011", "2011", appearances=46),
                stint(13, "kabuscorp", "Kabuscorp", "2012", "2012", appearances=21),
                stint(14, "sao_caetano", "São Caetano", "2013", "2013", appearances=19),
                stint(15, "mogi_mirim", "Mogi Mirim", "2014", "2015", appearances=9)
            ],
            provider_ids={"transfermarkt": "3372", "wikidata": "Q483577"}
        ),
        player(
            "romario", "Romário", "Romário de Souza Faria",
            ["Romario", "O Baixinho", "Romario de Souza Faria"],
            "1966-01-29", ["Brazil"], "retired",
            [
                stint(1, "vasco_da_gama", "Vasco da Gama", "1985", "1988", appearances=142),
                stint(2, "psv_eindhoven", "PSV Eindhoven", "1988", "1993", appearances=148),
                stint(3, "fcb", "Barcelona", "1993", "1995", appearances=65),
                stint(4, "flamengo", "Flamengo", "1995", "1996", appearances=79),
                stint(5, "valencia", "Valencia", "1996", "1996", appearances=6),
                stint(6, "flamengo", "Flamengo", "1996", "1997", appearances=36, stint_type="loan"),
                stint(7, "valencia", "Valencia", "1997", "1997", appearances=6),
                stint(8, "flamengo", "Flamengo", "1998", "1999", appearances=94),
                stint(9, "vasco_da_gama", "Vasco da Gama", "2000", "2002", appearances=73),
                stint(10, "fluminense", "Fluminense", "2002", "2003", appearances=47),
                stint(11, "al_sadd", "Al-Sadd", "2003", "2003", appearances=3, stint_type="loan"),
                stint(12, "fluminense", "Fluminense", "2003", "2004", appearances=30),
                stint(13, "vasco_da_gama", "Vasco da Gama", "2005", "2006", appearances=43),
                stint(14, "miami_fc", "Miami FC", "2006", "2006", appearances=26),
                stint(15, "adelaide_united", "Adelaide United", "2006", "2006", appearances=4, stint_type="loan"),
                stint(16, "vasco_da_gama", "Vasco da Gama", "2007", "2007", appearances=19)
            ],
            provider_ids={"transfermarkt": "7980", "wikidata": "Q178649"}
        ),
        player(
            "paolo_maldini", "Paolo Maldini", "Paolo Cesare Maldini",
            ["Maldini", "Il Capitano", "Paolo Cesare Maldini"],
            "1968-06-26", ["Italy"], "retired",
            [
                stint(1, "acmilan", "AC Milan", "1984", "2009", appearances=901)
            ],
            provider_ids={"transfermarkt": "5803", "wikidata": "Q483628"}
        ),
        player(
            "francesco_totti", "Francesco Totti", "Francesco Totti",
            ["Totti", "Er Pupone", "Il Capitano"],
            "1976-09-27", ["Italy"], "retired",
            [
                stint(1, "asroma", "Roma", "1993", "2017", appearances=786)
            ],
            provider_ids={"transfermarkt": "5958", "wikidata": "Q361"}
        ),
        player(
            "carles_puyol", "Carles Puyol", "Carles Puyol Saforcada",
            ["Puyol", "El Tiburon", "Carles Puyol Saforcada"],
            "1978-04-13", ["Spain"], "retired",
            [
                stint(1, "fcb", "Barcelona", "1999", "2014", appearances=593)
            ],
            provider_ids={"transfermarkt": "7594", "wikidata": "Q17158"}
        ),
        player(
            "paul_scholes", "Paul Scholes", "Paul Scholes",
            ["Scholes", "The Ginger Prince"],
            "1974-11-16", ["England"], "retired",
            [
                stint(1, "manu", "Manchester United", "1994", "2013", appearances=718)
            ],
            provider_ids={"transfermarkt": "3397", "wikidata": "Q45611"}
        ),
        player(
            "ryan_giggs", "Ryan Giggs", "Ryan Joseph Giggs",
            ["Giggs", "Ryan Joseph Giggs"],
            "1973-11-29", ["Wales"], "retired",
            [
                stint(1, "manu", "Manchester United", "1990", "2014", appearances=963)
            ],
            provider_ids={"transfermarkt": "3406", "wikidata": "Q10528"}
        ),
        player(
            "jamie_carragher", "Jamie Carragher", "James Lee Duncan Carragher",
            ["Carragher", "James Lee Duncan Carragher"],
            "1978-01-28", ["England"], "retired",
            [
                stint(1, "lfc", "Liverpool", "1996", "2013", appearances=737)
            ],
            provider_ids={"transfermarkt": "3597", "wikidata": "Q175138"}
        ),
        player(
            "franco_baresi", "Franco Baresi", "Franco Baresi",
            ["Baresi", "Piscinin"],
            "1960-05-08", ["Italy"], "retired",
            [
                stint(1, "acmilan", "AC Milan", "1977", "1997", appearances=719)
            ],
            provider_ids={"transfermarkt": "10367", "wikidata": "Q189334"}
        ),
        player(
            "gary_neville", "Gary Neville", "Gary Alexander Neville",
            ["Neville", "Gary Alexander Neville"],
            "1975-02-18", ["England"], "retired",
            [
                stint(1, "manu", "Manchester United", "1992", "2011", appearances=602)
            ],
            provider_ids={"transfermarkt": "3403", "wikidata": "Q214960"}
        ),
        player(
            "tony_adams", "Tony Adams", "Tony Alexander Adams",
            ["Adams", "Mr. Arsenal", "Tony Alexander Adams"],
            "1966-10-10", ["England"], "retired",
            [
                stint(1, "afc", "Arsenal", "1983", "2002", appearances=672)
            ],
            provider_ids={"transfermarkt": "10688", "wikidata": "Q295627"}
        ),
        player(
            "lev_yashin", "Lev Yashin", "Lev Ivanovich Yashin",
            ["Yashin", "The Black Spider", "Lev Ivanovich Yashin"],
            "1929-10-22", ["Russia"], "deceased",
            [
                stint(1, "dynamo_moscow", "Dynamo Moscow", "1950", "1970", appearances=326)
            ],
            provider_ids={"transfermarkt": "174987", "wikidata": "Q167827"}
        ),
        player(
            "ferenc_puskas", "Ferenc Puskás", "Ferenc Purczeld Puskás",
            ["Puskas", "The Galloping Major", "Ferenc Purczeld Puskas"],
            "1927-04-01", ["Hungary"], "deceased",
            [
                stint(1, "budapest_honved", "Budapest Honvéd", "1943", "1956", appearances=354),
                stint(2, "rmcf", "Real Madrid", "1958", "1966", appearances=262)
            ],
            provider_ids={"transfermarkt": "135704", "wikidata": "Q482931"}
        ),
        player(
            "marco_van_basten", "Marco van Basten", "Marcel van Basten",
            ["Van Basten", "Marcel van Basten"],
            "1964-10-31", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "1981", "1987", appearances=172),
                stint(2, "acmilan", "AC Milan", "1987", "1995", appearances=201)
            ],
            provider_ids={"transfermarkt": "101033", "wikidata": "Q483629"}
        ),
        player(
            "kenny_dalglish", "Kenny Dalglish", "Sir Kenneth Mathieson Dalglish",
            ["Dalglish", "King Kenny", "Kenneth Mathieson Dalglish"],
            "1951-03-04", ["Scotland"], "retired",
            [
                stint(1, "celtic", "Celtic", "1969", "1977", appearances=338),
                stint(2, "lfc", "Liverpool", "1977", "1990", appearances=515)
            ],
            provider_ids={"transfermarkt": "135269", "wikidata": "Q187198"}
        ),
        player(
            "steven_gerrard", "Steven Gerrard", "Steven George Gerrard",
            ["Gerrard", "Stevie G", "Steven George Gerrard"],
            "1980-05-30", ["England"], "retired",
            [
                stint(1, "lfc", "Liverpool", "1998", "2015", appearances=710),
                stint(2, "la_galaxy", "LA Galaxy", "2015", "2016", appearances=39)
            ],
            provider_ids={"transfermarkt": "3109", "wikidata": "Q45924"}
        ),
        player(
            "matt_le_tissier", "Matt Le Tissier", "Matthew Paul Le Tissier",
            ["Le Tissier", "Le God", "Matthew Le Tissier"],
            "1968-10-14", ["England"], "retired",
            [
                stint(1, "southampton", "Southampton", "1986", "2002", appearances=540),
                stint(2, "eastleigh", "Eastleigh", "2002", "2003", appearances=17)
            ],
            provider_ids={"transfermarkt": "4243", "wikidata": "Q312450"}
        ),
        player(
            "sepp_maier", "Sepp Maier", "Josef Dieter Maier",
            ["Maier", "Josef Dieter Maier", "Die Katze von Anzing"],
            "1944-02-28", ["Germany"], "retired",
            [
                stint(1, "bayern", "Bayern Munich", "1962", "1979", appearances=699)
            ],
            provider_ids={"transfermarkt": "95604", "wikidata": "Q107125"}
        ),
        player(
            "bobby_charlton", "Bobby Charlton", "Sir Robert Charlton",
            ["Charlton", "Sir Bobby Charlton", "Robert Charlton"],
            "1937-10-11", ["England"], "deceased",
            [
                stint(1, "manu", "Manchester United", "1956", "1973", appearances=758),
                stint(2, "preston_north_end", "Preston North End", "1974", "1975", appearances=45),
                stint(3, "waterford", "Waterford", "1976", "1976", appearances=4)
            ],
            provider_ids={"transfermarkt": "174822", "wikidata": "Q171171"}
        ),
        player(
            "dennis_bergkamp", "Dennis Bergkamp", "Dennis Nicolaas Maria Bergkamp",
            ["Bergkamp", "The Non-Flying Dutchman", "Dennis Nicolaas Maria Bergkamp"],
            "1969-05-10", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "1986", "1993", appearances=239),
                stint(2, "inter", "Inter Milan", "1993", "1995", appearances=74),
                stint(3, "afc", "Arsenal", "1995", "2006", appearances=423)
            ],
            provider_ids={"transfermarkt": "3187", "wikidata": "Q179569"}
        ),
        player(
            "ruud_gullit", "Ruud Gullit", "Rudi Dil Gullit",
            ["Gullit", "Rudi Dil Gullit"],
            "1962-09-01", ["Netherlands"], "retired",
            [
                stint(1, "hfc_haarlem", "HFC Haarlem", "1979", "1982", appearances=101),
                stint(2, "feyenoord", "Feyenoord", "1982", "1985", appearances=101),
                stint(3, "psv_eindhoven", "PSV Eindhoven", "1985", "1987", appearances=75),
                stint(4, "acmilan", "AC Milan", "1987", "1993", appearances=171),
                stint(5, "sampdoria", "Sampdoria", "1993", "1994", appearances=35),
                stint(6, "acmilan", "AC Milan", "1994", "1994", appearances=14),
                stint(7, "sampdoria", "Sampdoria", "1994", "1995", appearances=22),
                stint(8, "cfc", "Chelsea", "1995", "1998", appearances=64)
            ],
            provider_ids={"transfermarkt": "8023", "wikidata": "Q193635"}
        ),
        player(
            "frank_rijkaard", "Frank Rijkaard", "Franklin Edmundo Rijkaard",
            ["Rijkaard", "Franklin Edmundo Rijkaard"],
            "1962-09-30", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "1980", "1987", appearances=261),
                stint(2, "real_zaragoza", "Real Zaragoza", "1987", "1988", appearances=11, stint_type="loan"),
                stint(3, "acmilan", "AC Milan", "1988", "1993", appearances=201),
                stint(4, "ajax", "Ajax", "1993", "1995", appearances=76)
            ],
            provider_ids={"transfermarkt": "7002", "wikidata": "Q214902"},
            exclusions=[{"club": "Sporting CP", "reason": "administrative-return", "evidence": "Signed for Sporting in 1987 after transfer deadline; could not be registered for competitive appearances; immediately loaned to Zaragoza without appearing for Sporting."}]
        ),
        player(
            "michel_platini", "Michel Platini", "Michel François Platini",
            ["Platini", "Le Roi", "Michel Francois Platini"],
            "1955-06-21", ["France"], "retired",
            [
                stint(1, "nancy", "Nancy", "1972", "1979", appearances=214),
                stint(2, "saint_etienne", "Saint-Étienne", "1979", "1982", appearances=145),
                stint(3, "juve", "Juventus", "1982", "1987", appearances=224)
            ],
            provider_ids={"transfermarkt": "112351", "wikidata": "Q4261"}
        ),
        player(
            "franz_beckenbauer", "Franz Beckenbauer", "Franz Anton Beckenbauer",
            ["Beckenbauer", "Der Kaiser", "Franz Anton Beckenbauer"],
            "1945-09-11", ["Germany"], "deceased",
            [
                stint(1, "bayern", "Bayern Munich", "1964", "1977", appearances=582),
                stint(2, "new_york_cosmos", "New York Cosmos", "1977", "1980", appearances=105),
                stint(3, "hamburger_sv", "Hamburger SV", "1980", "1982", appearances=38),
                stint(4, "new_york_cosmos", "New York Cosmos", "1983", "1983", appearances=27)
            ],
            provider_ids={"transfermarkt": "72347", "wikidata": "Q4407"}
        ),
        player(
            "gerd_muller", "Gerd Müller", "Gerhard Müller",
            ["Muller", "Der Bomber", "Gerhard Muller", "Gerd Mueller"],
            "1945-11-03", ["Germany"], "deceased",
            [
                stint(1, "tsch_nordlingen", "1861 Nördlingen", "1963", "1964", appearances=31),
                stint(2, "bayern", "Bayern Munich", "1964", "1979", appearances=605),
                stint(3, "fort_lauderdale_strikers", "Fort Lauderdale Strikers", "1979", "1981", appearances=80)
            ],
            provider_ids={"transfermarkt": "72351", "wikidata": "Q43479"}
        ),
        player(
            "lothar_matthaus", "Lothar Matthäus", "Lothar Herbert Matthäus",
            ["Matthaus", "Lothar Herbert Matthaus", "Lothar Matthaeus"],
            "1961-03-21", ["Germany"], "retired",
            [
                stint(1, "herzogenaurach", "1. FC Herzogenaurach", "1978", "1979", appearances=22),
                stint(2, "borussia_monchengladbach", "Borussia Mönchengladbach", "1979", "1984", appearances=200),
                stint(3, "bayern", "Bayern Munich", "1984", "1988", appearances=154),
                stint(4, "inter", "Inter Milan", "1988", "1992", appearances=153),
                stint(5, "bayern", "Bayern Munich", "1992", "2000", appearances=256),
                stint(6, "metrostars", "MetroStars", "2000", "2000", appearances=21)
            ],
            provider_ids={"transfermarkt": "3443", "wikidata": "Q177577"}
        ),
        player(
            "roberto_baggio", "Roberto Baggio", "Roberto Baggio",
            ["Baggio", "Il Divin Codino"],
            "1967-02-18", ["Italy"], "retired",
            [
                stint(1, "vicenza", "Vicenza", "1982", "1985", appearances=47),
                stint(2, "fiorentina", "Fiorentina", "1985", "1990", appearances=136),
                stint(3, "juve", "Juventus", "1990", "1995", appearances=200),
                stint(4, "acmilan", "AC Milan", "1995", "1997", appearances=67),
                stint(5, "bologna", "Bologna", "1997", "1998", appearances=33),
                stint(6, "inter", "Inter Milan", "1998", "2000", appearances=59),
                stint(7, "brescia", "Brescia", "2000", "2004", appearances=101)
            ],
            provider_ids={"transfermarkt": "4153", "wikidata": "Q48284"}
        ),
        player(
            "alessandro_del_piero", "Alessandro Del Piero", "Alessandro Del Piero",
            ["Del Piero", "Pinturicchio"],
            "1974-11-09", ["Italy"], "retired",
            [
                stint(1, "padova", "Padova", "1991", "1993", appearances=14),
                stint(2, "juve", "Juventus", "1993", "2012", appearances=705),
                stint(3, "sydney_fc", "Sydney FC", "2012", "2014", appearances=48),
                stint(4, "delhi_dynamos", "Delhi Dynamos", "2014", "2014", appearances=10)
            ],
            provider_ids={"transfermarkt": "4289", "wikidata": "Q47318"}
        ),
        player(
            "george_best", "George Best", "George Best",
            ["Best", "El Beatle"],
            "1946-05-22", ["Northern Ireland"], "deceased",
            [
                stint(1, "manu", "Manchester United", "1963", "1974", appearances=470),
                stint(2, "stockport_county", "Stockport County", "1975", "1975", appearances=3),
                stint(3, "cork_celtic", "Cork Celtic", "1975", "1976", appearances=3),
                stint(4, "los_angeles_aztecs", "Los Angeles Aztecs", "1976", "1976", appearances=24),
                stint(5, "fulham", "Fulham", "1976", "1977", appearances=47),
                stint(6, "los_angeles_aztecs", "Los Angeles Aztecs", "1977", "1978", appearances=37),
                stint(7, "fort_lauderdale_strikers", "Fort Lauderdale Strikers", "1978", "1979", appearances=33),
                stint(8, "hibernian", "Hibernian", "1979", "1980", appearances=22),
                stint(9, "san_jose_earthquakes", "San Jose Earthquakes", "1980", "1981", appearances=56),
                stint(10, "bournemouth", "Bournemouth", "1983", "1983", appearances=5),
                stint(11, "brisbane_lions", "Brisbane Lions", "1983", "1983", appearances=4)
            ],
            provider_ids={"transfermarkt": "174986", "wikidata": "Q164538"}
        ),
        player(
            "eusebio", "Eusébio", "Eusébio da Silva Ferreira",
            ["Eusebio", "The Black Panther", "Eusebio da Silva Ferreira"],
            "1942-01-25", ["Portugal"], "deceased",
            [
                stint(1, "sporting_lourenco_marques", "Sporting Lourenço Marques", "1957", "1960", appearances=42),
                stint(2, "benfica", "Benfica", "1960", "1975", appearances=440),
                stint(3, "boston_minutemen", "Boston Minutemen", "1975", "1975", appearances=8),
                stint(4, "monterrey", "Monterrey", "1975", "1976", appearances=10),
                stint(5, "toronto_blizzard", "Toronto Blizzard", "1976", "1976", appearances=25),
                stint(6, "beira_mar", "Beira-Mar", "1976", "1977", appearances=12),
                stint(7, "las_vegas_quicksilvers", "Las Vegas Quicksilvers", "1977", "1977", appearances=17),
                stint(8, "uniao_de_tomar", "União de Tomar", "1977", "1978", appearances=12),
                stint(9, "new_jersey_americans", "New Jersey Americans", "1978", "1978", appearances=9)
            ],
            provider_ids={"transfermarkt": "72365", "wikidata": "Q48465"}
        ),
        player(
            "alfredo_di_stefano", "Alfredo Di Stéfano", "Alfredo Stéfano Di Stéfano Laulhé",
            ["Di Stefano", "Saeta Rubia", "Alfredo Di Stefano"],
            "1926-07-04", ["Spain", "Argentina"], "deceased",
            [
                stint(1, "river_plate", "River Plate", "1945", "1945", appearances=1),
                stint(2, "huracan", "Huracán", "1946", "1946", appearances=25, stint_type="loan"),
                stint(3, "river_plate", "River Plate", "1947", "1949", appearances=71),
                stint(4, "millonarios", "Millonarios", "1949", "1953", appearances=111),
                stint(5, "rmcf", "Real Madrid", "1953", "1964", appearances=396),
                stint(6, "espanyol", "Espanyol", "1964", "1966", appearances=60)
            ],
            provider_ids={"transfermarkt": "135703", "wikidata": "Q45322"}
        ),
        player(
            "dino_zoff", "Dino Zoff", "Dino Zoff",
            ["Zoff"],
            "1942-02-28", ["Italy"], "retired",
            [
                stint(1, "udinese", "Udinese", "1961", "1963", appearances=39),
                stint(2, "mantova", "Mantova", "1963", "1967", appearances=134),
                stint(3, "napoli", "Napoli", "1967", "1972", appearances=190),
                stint(4, "juve", "Juventus", "1972", "1983", appearances=476)
            ],
            provider_ids={"transfermarkt": "86002", "wikidata": "Q181744"}
        ),
        player(
            "ian_rush", "Ian Rush", "Ian James Rush",
            ["Rush", "Ian James Rush"],
            "1961-10-20", ["Wales"], "retired",
            [
                stint(1, "chester_city", "Chester City", "1978", "1980", appearances=39),
                stint(2, "lfc", "Liverpool", "1980", "1987", appearances=331),
                stint(3, "juve", "Juventus", "1987", "1988", appearances=39),
                stint(4, "lfc", "Liverpool", "1988", "1996", appearances=329),
                stint(5, "leeds_united", "Leeds United", "1996", "1997", appearances=43),
                stint(6, "newcastle", "Newcastle United", "1997", "1998", appearances=14),
                stint(7, "sheffield_united", "Sheffield United", "1998", "1998", appearances=4, stint_type="loan"),
                stint(8, "wrexham", "Wrexham", "1998", "1999", appearances=24),
                stint(9, "sydney_olympic", "Sydney Olympic", "1999", "1999", appearances=3)
            ],
            provider_ids={"transfermarkt": "145743", "wikidata": "Q216398"}
        ),
        player(
            "eric_cantona", "Eric Cantona", "Éric Daniel Pierre Cantona",
            ["Cantona", "King Eric", "Eric Daniel Pierre Cantona"],
            "1966-05-24", ["France"], "retired",
            [
                stint(1, "auxerre", "Auxerre", "1983", "1985", appearances=16),
                stint(2, "martigues", "Martigues", "1985", "1986", appearances=15, stint_type="loan"),
                stint(3, "auxerre", "Auxerre", "1986", "1988", appearances=78),
                stint(4, "marseille", "Marseille", "1988", "1989", appearances=28),
                stint(5, "bordeaux", "Bordeaux", "1989", "1989", appearances=12, stint_type="loan"),
                stint(6, "montpellier", "Montpellier", "1989", "1990", appearances=39, stint_type="loan"),
                stint(7, "marseille", "Marseille", "1990", "1991", appearances=19),
                stint(8, "nimes", "Nîmes", "1991", "1991", appearances=17),
                stint(9, "leeds_united", "Leeds United", "1992", "1992", appearances=35),
                stint(10, "manu", "Manchester United", "1992", "1997", appearances=185)
            ],
            provider_ids={"transfermarkt": "12000", "wikidata": "Q170328"}
        ),
        player(
            "hristo_stoichkov", "Hristo Stoichkov", "Hristo Stoichkov Stoichkov",
            ["Stoichkov", "The Dagger", "Hristo Stoichkov Stoichkov"],
            "1966-02-08", ["Bulgaria"], "retired",
            [
                stint(1, "hebros_harmanli", "Hebros Harmanli", "1982", "1984", appearances=32),
                stint(2, "cska_sofia", "CSKA Sofia", "1984", "1990", appearances=160),
                stint(3, "fcb", "Barcelona", "1990", "1995", appearances=214),
                stint(4, "parma", "Parma", "1995", "1996", appearances=30),
                stint(5, "fcb", "Barcelona", "1996", "1998", appearances=41),
                stint(6, "cska_sofia", "CSKA Sofia", "1998", "1998", appearances=5),
                stint(7, "al_nassr", "Al Nassr", "1998", "1998", appearances=2),
                stint(8, "kashiwa_reysol", "Kashiwa Reysol", "1998", "1999", appearances=29),
                stint(9, "chicago_fire", "Chicago Fire", "2000", "2002", appearances=57),
                stint(10, "dc_united", "D.C. United", "2003", "2003", appearances=24)
            ],
            provider_ids={"transfermarkt": "7938", "wikidata": "Q187126"}
        ),
        player(
            "gheorghe_hagi", "Gheorghe Hagi", "Gheorghe Hagi",
            ["Hagi", "The Maradona of the Carpathians"],
            "1965-02-05", ["Romania"], "retired",
            [
                stint(1, "farul_constanta", "Farul Constanța", "1982", "1983", appearances=18),
                stint(2, "sportul_studentesc", "Sportul Studențesc", "1983", "1987", appearances=124),
                stint(3, "steaua_bucharest", "Steaua București", "1987", "1990", appearances=128),
                stint(4, "rmcf", "Real Madrid", "1990", "1992", appearances=84),
                stint(5, "brescia", "Brescia", "1992", "1994", appearances=65),
                stint(6, "fcb", "Barcelona", "1994", "1996", appearances=51),
                stint(7, "galatasaray", "Galatasaray", "1996", "2001", appearances=192)
            ],
            provider_ids={"transfermarkt": "3129", "wikidata": "Q187138"}
        ),
        player(
            "andriy_shevchenko", "Andriy Shevchenko", "Andriy Mykolayovych Shevchenko",
            ["Shevchenko", "Sheva", "Andriy Mykolayovych Shevchenko"],
            "1976-09-29", ["Ukraine"], "retired",
            [
                stint(1, "dynamo_kyiv", "Dynamo Kyiv", "1994", "1999", appearances=166),
                stint(2, "acmilan", "AC Milan", "1999", "2006", appearances=296),
                stint(3, "cfc", "Chelsea", "2006", "2008", appearances=77),
                stint(4, "acmilan", "AC Milan", "2008", "2009", appearances=26, stint_type="loan"),
                stint(5, "dynamo_kyiv", "Dynamo Kyiv", "2009", "2012", appearances=83)
            ],
            provider_ids={"transfermarkt": "3522", "wikidata": "Q41538"}
        ),
        player(
            "george_weah", "George Weah", "George Manneh Oppong Weah",
            ["Weah", "King George", "George Manneh Oppong Weah"],
            "1966-10-01", ["Liberia"], "retired",
            [
                stint(1, "mighty_barrolle", "Mighty Barrolle", "1985", "1986", appearances=10),
                stint(2, "invincible_eleven", "Invincible Eleven", "1986", "1987", appearances=23),
                stint(3, "tonnerre_yaounde", "Tonnerre Yaoundé", "1987", "1988", appearances=18),
                stint(4, "monaco", "Monaco", "1988", "1992", appearances=149),
                stint(5, "psg", "Paris Saint-Germain", "1992", "1995", appearances=138),
                stint(6, "acmilan", "AC Milan", "1995", "2000", appearances=147),
                stint(7, "cfc", "Chelsea", "2000", "2000", appearances=15, stint_type="loan"),
                stint(8, "mancity", "Manchester City", "2000", "2000", appearances=9),
                stint(9, "marseille", "Marseille", "2000", "2001", appearances=20),
                stint(10, "al_jazira", "Al Jazira", "2001", "2003", appearances=38)
            ],
            provider_ids={"transfermarkt": "8542", "wikidata": "Q173139"}
        ),
        player(
            "samuel_etoo", "Samuel Eto'o", "Samuel Eto'o Fils",
            ["Eto'o", "Samuel Etoo", "Samuel Eto'o Fils"],
            "1981-03-10", ["Cameroon"], "retired",
            [
                stint(1, "leganes", "Leganés", "1997", "1998", appearances=30, stint_type="loan"),
                stint(2, "rmcf", "Real Madrid", "1998", "2000", appearances=7),
                stint(3, "mallorca", "Mallorca", "2000", "2004", appearances=165),
                stint(4, "fcb", "Barcelona", "2004", "2009", appearances=199),
                stint(5, "inter", "Inter Milan", "2009", "2011", appearances=102),
                stint(6, "anzhi_makhachkala", "Anzhi Makhachkala", "2011", "2013", appearances=73),
                stint(7, "cfc", "Chelsea", "2013", "2014", appearances=35),
                stint(8, "everton", "Everton", "2014", "2015", appearances=20),
                stint(9, "sampdoria", "Sampdoria", "2015", "2015", appearances=18),
                stint(10, "antalyaspor", "Antalyaspor", "2015", "2018", appearances=77),
                stint(11, "konyaspor", "Konyaspor", "2018", "2018", appearances=14),
                stint(12, "qatar_sc", "Qatar SC", "2018", "2019", appearances=18)
            ],
            provider_ids={"transfermarkt": "4257", "wikidata": "Q125088"},
            exclusions=[{"club": "Espanyol", "reason": "unused-loan", "evidence": "Loaned from Real Madrid to Espanyol in Jan 1999; made 0 official competitive first-team appearances."}]
        ),
        player(
            "didier_drogba", "Didier Drogba", "Didier Yves Drogba Tébily",
            ["Drogba", "Didier Yves Drogba Tebily"],
            "1978-03-11", ["Ivory Coast"], "retired",
            [
                stint(1, "le_mans", "Le Mans", "1998", "2002", appearances=72),
                stint(2, "guingamp", "Guingamp", "2002", "2003", appearances=50),
                stint(3, "marseille", "Marseille", "2003", "2004", appearances=55),
                stint(4, "cfc", "Chelsea", "2004", "2012", appearances=341),
                stint(5, "shanghai_shenhua", "Shanghai Shenhua", "2012", "2013", appearances=11),
                stint(6, "galatasaray", "Galatasaray", "2013", "2014", appearances=53),
                stint(7, "cfc", "Chelsea", "2014", "2015", appearances=40),
                stint(8, "montreal_impact", "Montreal Impact", "2015", "2016", appearances=41),
                stint(9, "phoenix_rising", "Phoenix Rising", "2017", "2018", appearances=26)
            ],
            provider_ids={"transfermarkt": "3924", "wikidata": "Q48892"}
        ),
        player(
            "yaya_toure", "Yaya Touré", "Gnégnéri Yaya Touré",
            ["Yaya Toure", "Gnegneri Yaya Toure"],
            "1983-05-13", ["Ivory Coast"], "retired",
            [
                stint(1, "beveren", "Beveren", "2001", "2003", appearances=70),
                stint(2, "metalurh_donetsk", "Metalurh Donetsk", "2003", "2005", appearances=39),
                stint(3, "olympiacos", "Olympiacos", "2005", "2006", appearances=26),
                stint(4, "monaco", "Monaco", "2006", "2007", appearances=28),
                stint(5, "fcb", "Barcelona", "2007", "2010", appearances=118),
                stint(6, "mancity", "Manchester City", "2010", "2018", appearances=316),
                stint(7, "olympiacos", "Olympiacos", "2018", "2018", appearances=5),
                stint(8, "qingdao_huanghai", "Qingdao Huanghai", "2019", "2019", appearances=14)
            ],
            provider_ids={"transfermarkt": "13091", "wikidata": "Q184852"}
        ),
        player(
            "jay_jay_okocha", "Jay-Jay Okocha", "Augustine Azuka Okocha",
            ["Okocha", "Jay Jay Okocha", "Augustine Azuka Okocha"],
            "1973-08-14", ["Nigeria"], "retired",
            [
                stint(1, "borussia_neunkirchen", "Borussia Neunkirchen", "1990", "1992", appearances=35),
                stint(2, "frankfruit", "Eintracht Frankfurt", "1992", "1996", appearances=116),
                stint(3, "fenerbahce", "Fenerbahçe", "1996", "1998", appearances=62),
                stint(4, "psg", "Paris Saint-Germain", "1998", "2002", appearances=113),
                stint(5, "bolton_wanderers", "Bolton Wanderers", "2002", "2006", appearances=145),
                stint(6, "qatar_sc", "Qatar SC", "2006", "2007", appearances=41),
                stint(7, "hull_city", "Hull City", "2007", "2008", appearances=19)
            ],
            provider_ids={"transfermarkt": "3708", "wikidata": "Q204482"}
        ),
        player(
            "nwankwo_kanu", "Nwankwo Kanu", "Nwankwo Christian Kanu",
            ["Kanu", "Papilo", "Nwankwo Christian Kanu"],
            "1976-08-01", ["Nigeria"], "retired",
            [
                stint(1, "iwuanyanwu_nationale", "Iwuanyanwu Nationale", "1992", "1993", appearances=25),
                stint(2, "ajax", "Ajax", "1993", "1996", appearances=74),
                stint(3, "inter", "Inter Milan", "1996", "1999", appearances=20),
                stint(4, "afc", "Arsenal", "1999", "2004", appearances=197),
                stint(5, "west_bromwich_albion", "West Bromwich Albion", "2004", "2006", appearances=58),
                stint(6, "portsmouth", "Portsmouth", "2006", "2012", appearances=168)
            ],
            provider_ids={"transfermarkt": "3133", "wikidata": "Q201383"}
        ),
        player(
            "michael_essien", "Michael Essien", "Michael Kojo Essien",
            ["Essien", "The Bison", "Michael Kojo Essien"],
            "1982-12-03", ["Ghana"], "retired",
            [
                stint(1, "bastia", "Bastia", "2000", "2003", appearances=76),
                stint(2, "lyon", "Lyon", "2003", "2005", appearances=96),
                stint(3, "cfc", "Chelsea", "2005", "2012", appearances=247),
                stint(4, "rmcf", "Real Madrid", "2012", "2013", appearances=35, stint_type="loan"),
                stint(5, "cfc", "Chelsea", "2013", "2014", appearances=9),
                stint(6, "acmilan", "AC Milan", "2014", "2015", appearances=22),
                stint(7, "panathinaikos", "Panathinaikos", "2015", "2016", appearances=15),
                stint(8, "persib_bandung", "Persib Bandung", "2017", "2017", appearances=29),
                stint(9, "sabail", "Sabail", "2019", "2020", appearances=15)
            ],
            provider_ids={"transfermarkt": "5588", "wikidata": "Q174825"}
        ),
        player(
            "park_ji_sung", "Park Ji-sung", "Park Ji-sung",
            ["Park Ji Sung", "Three Lungs Park"],
            "1981-02-25", ["South Korea"], "retired",
            [
                stint(1, "kyoto_purple_sanga", "Kyoto Purple Sanga", "2000", "2003", appearances=85),
                stint(2, "psv_eindhoven", "PSV Eindhoven", "2003", "2005", appearances=91),
                stint(3, "manu", "Manchester United", "2005", "2012", appearances=205),
                stint(4, "queens_park_rangers", "Queens Park Rangers", "2012", "2013", appearances=25),
                stint(5, "psv_eindhoven", "PSV Eindhoven", "2013", "2014", appearances=27, stint_type="loan")
            ],
            provider_ids={"transfermarkt": "4433", "wikidata": "Q184857"}
        ),
        player(
            "hidetoshi_nakata", "Hidetoshi Nakata", "Hidetoshi Nakata",
            ["Nakata"],
            "1977-01-22", ["Japan"], "retired",
            [
                stint(1, "bellmare_hiratsuka", "Bellmare Hiratsuka", "1995", "1998", appearances=109),
                stint(2, "perugia", "Perugia", "1998", "2000", appearances=55),
                stint(3, "asroma", "Roma", "2000", "2001", appearances=40),
                stint(4, "parma", "Parma", "2001", "2004", appearances=92),
                stint(5, "bologna", "Bologna", "2004", "2004", appearances=17, stint_type="loan"),
                stint(6, "fiorentina", "Fiorentina", "2004", "2005", appearances=33),
                stint(7, "bolton_wanderers", "Bolton Wanderers", "2005", "2006", appearances=32, stint_type="loan")
            ],
            provider_ids={"transfermarkt": "3450", "wikidata": "Q216955"}
        ),
        player(
            "keisuke_honda", "Keisuke Honda", "Keisuke Honda",
            ["Honda", "Emperor Keisuke"],
            "1986-06-13", ["Japan"], "retired",
            [
                stint(1, "nagoya_grampus", "Nagoya Grampus", "2005", "2007", appearances=105),
                stint(2, "vvv_venlo", "VVV-Venlo", "2008", "2009", appearances=74),
                stint(3, "cska_moscow", "CSKA Moscow", "2010", "2013", appearances=127),
                stint(4, "acmilan", "AC Milan", "2014", "2017", appearances=92),
                stint(5, "pachuca", "Pachuca", "2017", "2018", appearances=36),
                stint(6, "melbourne_victory", "Melbourne Victory", "2018", "2019", appearances=24),
                stint(7, "vitesse", "Vitesse", "2019", "2019", appearances=4),
                stint(8, "botafogo", "Botafogo", "2020", "2020", appearances=27),
                stint(9, "neftci", "Neftçi", "2021", "2021", appearances=7),
                stint(10, "suduva", "Sūduva", "2021", "2021", appearances=6)
            ],
            provider_ids={"transfermarkt": "54497", "wikidata": "Q185566"}
        ),
        player(
            "landon_donovan", "Landon Donovan", "Landon Timothy Donovan",
            ["Donovan", "Landon Timothy Donovan"],
            "1982-03-04", ["United States"], "retired",
            [
                stint(1, "san_jose_earthquakes", "San Jose Earthquakes", "2001", "2004", appearances=101, stint_type="loan"),
                stint(2, "leverkusen", "Bayer Leverkusen", "2005", "2005", appearances=9),
                stint(3, "la_galaxy", "LA Galaxy", "2005", "2008", appearances=118),
                stint(4, "bayern", "Bayern Munich", "2009", "2009", appearances=7, stint_type="loan"),
                stint(5, "la_galaxy", "LA Galaxy", "2009", "2009", appearances=30),
                stint(6, "everton", "Everton", "2010", "2010", appearances=13, stint_type="loan"),
                stint(7, "la_galaxy", "LA Galaxy", "2010", "2011", appearances=53),
                stint(8, "everton", "Everton", "2012", "2012", appearances=9, stint_type="loan"),
                stint(9, "la_galaxy", "LA Galaxy", "2012", "2016", appearances=94),
                stint(10, "club_leon", "León", "2018", "2018", appearances=8)
            ],
            provider_ids={"transfermarkt": "249", "wikidata": "Q187121"}
        ),
        player(
            "clint_dempsey", "Clint Dempsey", "Clinton Drew Dempsey",
            ["Dempsey", "Deuce", "Clinton Drew Dempsey"],
            "1983-03-09", ["United States"], "retired",
            [
                stint(1, "new_england_revolution", "New England Revolution", "2004", "2006", appearances=84),
                stint(2, "fulham", "Fulham", "2007", "2012", appearances=232),
                stint(3, "tottenham", "Tottenham Hotspur", "2012", "2013", appearances=43),
                stint(4, "seattle_sounders", "Seattle Sounders", "2013", "2013", appearances=12),
                stint(5, "fulham", "Fulham", "2014", "2014", appearances=7, stint_type="loan"),
                stint(6, "seattle_sounders", "Seattle Sounders", "2014", "2018", appearances=174)
            ],
            provider_ids={"transfermarkt": "27577", "wikidata": "Q207535"}
        ),
        player(
            "rafael_marquez", "Rafael Márquez", "Rafael Márquez Álvarez",
            ["Marquez", "El Kaiser de Michoacan", "Rafael Marquez Alvarez"],
            "1979-02-13", ["Mexico"], "retired",
            [
                stint(1, "atlas", "Atlas", "1996", "1999", appearances=80),
                stint(2, "monaco", "Monaco", "1999", "2003", appearances=109),
                stint(3, "fcb", "Barcelona", "2003", "2010", appearances=242),
                stint(4, "new_york_red_bulls", "New York Red Bulls", "2010", "2012", appearances=50),
                stint(5, "club_leon", "León", "2013", "2014", appearances=58),
                stint(6, "hellas_verona", "Hellas Verona", "2014", "2015", appearances=39),
                stint(7, "atlas", "Atlas", "2016", "2018", appearances=64)
            ],
            provider_ids={"transfermarkt": "7564", "wikidata": "Q174982"}
        ),
        player(
            "hugo_sanchez", "Hugo Sánchez", "Hugo Sánchez Márquez",
            ["Hugo Sanchez", "Hugol", "Pentapichichi", "Hugo Sanchez Marquez"],
            "1958-07-11", ["Mexico"], "retired",
            [
                stint(1, "unam", "UNAM", "1976", "1979", appearances=105),
                stint(2, "san_diego_sockers", "San Diego Sockers", "1979", "1979", appearances=17, stint_type="loan"),
                stint(3, "unam", "UNAM", "1979", "1980", appearances=44),
                stint(4, "san_diego_sockers", "San Diego Sockers", "1980", "1980", appearances=15, stint_type="loan"),
                stint(5, "unam", "UNAM", "1980", "1981", appearances=51),
                stint(6, "atletico", "Atlético Madrid", "1981", "1985", appearances=152),
                stint(7, "rmcf", "Real Madrid", "1985", "1992", appearances=283),
                stint(8, "club_america", "América", "1992", "1993", appearances=35),
                stint(9, "rayo_vallecano", "Rayo Vallecano", "1993", "1994", appearances=35),
                stint(10, "atlante", "Atlante", "1994", "1995", appearances=31),
                stint(11, "linz", "Linz", "1995", "1996", appearances=20),
                stint(12, "dallas_burn", "Dallas Burn", "1996", "1996", appearances=25),
                stint(13, "atletico_celaya", "Atlético Celaya", "1996", "1997", appearances=12)
            ],
            provider_ids={"transfermarkt": "104332", "wikidata": "Q487318"}
        ),
        player(
            "carlos_valderrama", "Carlos Valderrama", "Carlos Alberto Valderrama Palacio",
            ["Valderrama", "El Pibe", "Carlos Alberto Valderrama Palacio"],
            "1961-09-02", ["Colombia"], "retired",
            [
                stint(1, "union_magdalena", "Unión Magdalena", "1981", "1984", appearances=94),
                stint(2, "millonarios", "Millonarios", "1984", "1984", appearances=33),
                stint(3, "deportivo_cali", "Deportivo Cali", "1985", "1988", appearances=131),
                stint(4, "montpellier", "Montpellier", "1988", "1991", appearances=91),
                stint(5, "real_valladolid", "Real Valladolid", "1991", "1992", appearances=17),
                stint(6, "independiente_medellin", "Independiente Medellín", "1992", "1993", appearances=10),
                stint(7, "junior", "Junior", "1993", "1995", appearances=82),
                stint(8, "tampa_bay_mutiny", "Tampa Bay Mutiny", "1996", "1997", appearances=47),
                stint(9, "miami_fusion", "Miami Fusion", "1998", "1999", appearances=22),
                stint(10, "tampa_bay_mutiny", "Tampa Bay Mutiny", "1999", "2001", appearances=73),
                stint(11, "colorado_rapids", "Colorado Rapids", "2001", "2002", appearances=41)
            ],
            provider_ids={"transfermarkt": "87950", "wikidata": "Q204442"}
        ),
        player(
            "ivan_zamorano", "Iván Zamorano", "Iván Luis Zamorano Zamora",
            ["Zamorano", "Bam Bam", "Ivan Luis Zamorano Zamora"],
            "1967-01-18", ["Chile"], "retired",
            [
                stint(1, "cobresal", "Cobresal", "1985", "1986", appearances=31),
                stint(2, "cobreandino", "Cobreandino", "1986", "1986", appearances=29, stint_type="loan"),
                stint(3, "cobresal", "Cobresal", "1986", "1988", appearances=43),
                stint(4, "st_gallen", "St. Gallen", "1988", "1990", appearances=61),
                stint(5, "sevilla", "Sevilla", "1990", "1992", appearances=69),
                stint(6, "rmcf", "Real Madrid", "1992", "1996", appearances=173),
                stint(7, "inter", "Inter Milan", "1996", "2001", appearances=149),
                stint(8, "club_america", "América", "2001", "2002", appearances=63),
                stint(9, "colo_colo", "Colo-Colo", "2003", "2003", appearances=14)
            ],
            provider_ids={"transfermarkt": "12574", "wikidata": "Q216896"}
        ),
        player(
            "marcelo_salas", "Marcelo Salas", "José Marcelo Salas Melinao",
            ["Salas", "El Matador", "Jose Marcelo Salas Melinao"],
            "1974-12-24", ["Chile"], "retired",
            [
                stint(1, "universidad_de_chile", "Universidad de Chile", "1993", "1996", appearances=115),
                stint(2, "river_plate", "River Plate", "1996", "1998", appearances=67),
                stint(3, "lazio", "Lazio", "1998", "2001", appearances=117),
                stint(4, "juve", "Juventus", "2001", "2003", appearances=32),
                stint(5, "river_plate", "River Plate", "2003", "2005", appearances=49),
                stint(6, "universidad_de_chile", "Universidad de Chile", "2005", "2008", appearances=82)
            ],
            provider_ids={"transfermarkt": "3415", "wikidata": "Q216886"}
        ),
        player(
            "javier_zanetti", "Javier Zanetti", "Javier Adelmar Zanetti",
            ["Zanetti", "El Tractor", "Il Capitano", "Javier Adelmar Zanetti"],
            "1973-08-10", ["Argentina"], "retired",
            [
                stint(1, "talleres_re", "Talleres RE", "1992", "1993", appearances=33),
                stint(2, "banfield", "Banfield", "1993", "1995", appearances=66),
                stint(3, "inter", "Inter Milan", "1995", "2014", appearances=858)
            ],
            provider_ids={"transfermarkt": "3408", "wikidata": "Q52876"}
        ),
        player(
            "gabriel_batistuta", "Gabriel Batistuta", "Gabriel Omar Batistuta",
            ["Batistuta", "Batigol", "Gabriel Omar Batistuta"],
            "1969-02-01", ["Argentina"], "retired",
            [
                stint(1, "newells_old_boys", "Newell's Old Boys", "1988", "1989", appearances=28),
                stint(2, "river_plate", "River Plate", "1989", "1990", appearances=24),
                stint(3, "boca_juniors", "Boca Juniors", "1990", "1991", appearances=47),
                stint(4, "fiorentina", "Fiorentina", "1991", "2000", appearances=333),
                stint(5, "asroma", "Roma", "2000", "2003", appearances=87),
                stint(6, "inter", "Inter Milan", "2003", "2003", appearances=12, stint_type="loan"),
                stint(7, "al_arabi", "Al-Arabi", "2003", "2005", appearances=21)
            ],
            provider_ids={"transfermarkt": "4152", "wikidata": "Q170376"}
        ),
        player(
            "hernan_crespo", "Hernán Crespo", "Hernán Jorge Crespo",
            ["Crespo", "Hernan Jorge Crespo", "Valdanito"],
            "1975-07-05", ["Argentina"], "retired",
            [
                stint(1, "river_plate", "River Plate", "1993", "1996", appearances=84),
                stint(2, "parma", "Parma", "1996", "2000", appearances=201),
                stint(3, "lazio", "Lazio", "2000", "2002", appearances=73),
                stint(4, "inter", "Inter Milan", "2002", "2003", appearances=30),
                stint(5, "cfc", "Chelsea", "2003", "2004", appearances=31),
                stint(6, "acmilan", "AC Milan", "2004", "2005", appearances=40, stint_type="loan"),
                stint(7, "cfc", "Chelsea", "2005", "2006", appearances=42),
                stint(8, "inter", "Inter Milan", "2006", "2009", appearances=86),
                stint(9, "genoa", "Genoa", "2009", "2010", appearances=21),
                stint(10, "parma", "Parma", "2010", "2012", appearances=50)
            ],
            provider_ids={"transfermarkt": "3410", "wikidata": "Q160549"}
        ),
        player(
            "juan_roman_riquelme", "Juan Román Riquelme", "Juan Román Riquelme",
            ["Riquelme", "Juan Roman Riquelme"],
            "1978-06-24", ["Argentina"], "retired",
            [
                stint(1, "boca_juniors", "Boca Juniors", "1996", "2002", appearances=194),
                stint(2, "fcb", "Barcelona", "2002", "2003", appearances=42),
                stint(3, "villarreal", "Villarreal", "2003", "2007", appearances=144),
                stint(4, "boca_juniors", "Boca Juniors", "2007", "2014", appearances=194),
                stint(5, "argentinos_juniors", "Argentinos Juniors", "2014", "2014", appearances=18)
            ],
            provider_ids={"transfermarkt": "3854", "wikidata": "Q192965"}
        ),
        player(
            "juan_sebastian_veron", "Juan Sebastián Verón", "Juan Sebastián Verón",
            ["Veron", "La Brujita", "Juan Sebastian Veron"],
            "1975-03-09", ["Argentina"], "retired",
            [
                stint(1, "estudiantes", "Estudiantes", "1993", "1996", appearances=67),
                stint(2, "boca_juniors", "Boca Juniors", "1996", "1996", appearances=17),
                stint(3, "sampdoria", "Sampdoria", "1996", "1998", appearances=71),
                stint(4, "parma", "Parma", "1998", "1999", appearances=42),
                stint(5, "lazio", "Lazio", "1999", "2001", appearances=79),
                stint(6, "manu", "Manchester United", "2001", "2003", appearances=82),
                stint(7, "cfc", "Chelsea", "2003", "2004", appearances=14),
                stint(8, "inter", "Inter Milan", "2004", "2006", appearances=74, stint_type="loan"),
                stint(9, "estudiantes", "Estudiantes", "2006", "2012", appearances=205),
                stint(10, "brandsen", "Asociación Coronel Brandsen", "2012", "2013", appearances=28),
                stint(11, "estudiantes", "Estudiantes", "2013", "2017", appearances=27)
            ],
            provider_ids={"transfermarkt": "3145", "wikidata": "Q216894"}
        ),
        player(
            "carlos_tevez", "Carlos Tevez", "Carlos Alberto Martínez Tévez",
            ["Tevez", "Apache", "Carlos Alberto Martinez Tevez"],
            "1984-02-05", ["Argentina"], "retired",
            [
                stint(1, "boca_juniors", "Boca Juniors", "2001", "2004", appearances=110),
                stint(2, "corinthians", "Corinthians", "2005", "2006", appearances=76),
                stint(3, "west_ham", "West Ham United", "2006", "2007", appearances=29),
                stint(4, "manu", "Manchester United", "2007", "2009", appearances=99, stint_type="loan"),
                stint(5, "mancity", "Manchester City", "2009", "2013", appearances=148),
                stint(6, "juve", "Juventus", "2013", "2015", appearances=96),
                stint(7, "boca_juniors", "Boca Juniors", "2015", "2016", appearances=56),
                stint(8, "shanghai_shenhua", "Shanghai Shenhua", "2017", "2017", appearances=20),
                stint(9, "boca_juniors", "Boca Juniors", "2018", "2021", appearances=113)
            ],
            provider_ids={"transfermarkt": "4276", "wikidata": "Q50600"}
        ),
        player(
            "sergio_aguero", "Sergio Agüero", "Sergio Leonel Agüero del Castillo",
            ["Aguero", "Kun Aguero", "Sergio Leonel Aguero del Castillo"],
            "1988-06-02", ["Argentina"], "retired",
            [
                stint(1, "independiente", "Independiente", "2003", "2006", appearances=56),
                stint(2, "atletico", "Atlético Madrid", "2006", "2011", appearances=234),
                stint(3, "mancity", "Manchester City", "2011", "2021", appearances=390),
                stint(4, "fcb", "Barcelona", "2021", "2021", appearances=5)
            ],
            provider_ids={"transfermarkt": "26399", "wikidata": "Q119562"}
        ),
        player(
            "javier_mascherano", "Javier Mascherano", "Javier Alejandro Mascherano",
            ["Mascherano", "El Jefecito", "Javier Alejandro Mascherano"],
            "1984-06-08", ["Argentina"], "retired",
            [
                stint(1, "river_plate", "River Plate", "2003", "2005", appearances=71),
                stint(2, "corinthians", "Corinthians", "2005", "2006", appearances=33),
                stint(3, "west_ham", "West Ham United", "2006", "2007", appearances=7),
                stint(4, "lfc", "Liverpool", "2007", "2010", appearances=139),
                stint(5, "fcb", "Barcelona", "2010", "2018", appearances=334),
                stint(6, "hebei_china_fortune", "Hebei China Fortune", "2018", "2019", appearances=54),
                stint(7, "estudiantes", "Estudiantes", "2020", "2020", appearances=11)
            ],
            provider_ids={"transfermarkt": "19981", "wikidata": "Q161320"}
        ),
        player(
            "esteban_cambiasso", "Esteban Cambiasso", "Esteban Matías Cambiasso Del値au",
            ["Cambiasso", "Cuchu", "Esteban Matias Cambiasso"],
            "1980-08-18", ["Argentina"], "retired",
            [
                stint(1, "independiente", "Independiente", "1998", "2001", appearances=98),
                stint(2, "river_plate", "River Plate", "2001", "2002", appearances=37),
                stint(3, "rmcf", "Real Madrid", "2002", "2004", appearances=65),
                stint(4, "inter", "Inter Milan", "2004", "2014", appearances=430),
                stint(5, "leicester_city", "Leicester City", "2014", "2015", appearances=33),
                stint(6, "olympiacos", "Olympiacos", "2015", "2017", appearances=49)
            ],
            provider_ids={"transfermarkt": "7520", "wikidata": "Q192138"},
            exclusions=[{"club": "Real Madrid B", "reason": "b-team-only", "evidence": "Played for Real Madrid B 1996-1998 before senior first-team breakthrough in Argentina."}]
        ),
        player(
            "clarence_seedorf", "Clarence Seedorf", "Clarence Clyde Seedorf",
            ["Seedorf", "Clarence Clyde Seedorf"],
            "1976-04-01", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "1992", "1995", appearances=90),
                stint(2, "sampdoria", "Sampdoria", "1995", "1996", appearances=34),
                stint(3, "rmcf", "Real Madrid", "1996", "1999", appearances=159),
                stint(4, "inter", "Inter Milan", "1999", "2002", appearances=93),
                stint(5, "acmilan", "AC Milan", "2002", "2012", appearances=432),
                stint(6, "botafogo", "Botafogo", "2012", "2014", appearances=81)
            ],
            provider_ids={"transfermarkt": "3453", "wikidata": "Q184904"}
        ),
        player(
            "edgar_davids", "Edgar Davids", "Edgar Steven Davids",
            ["Davids", "The Pitbull", "Edgar Steven Davids"],
            "1973-03-13", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "1991", "1996", appearances=149),
                stint(2, "acmilan", "AC Milan", "1996", "1997", appearances=31),
                stint(3, "juve", "Juventus", "1997", "2004", appearances=235),
                stint(4, "fcb", "Barcelona", "2004", "2004", appearances=20, stint_type="loan"),
                stint(5, "inter", "Inter Milan", "2004", "2005", appearances=23),
                stint(6, "tottenham", "Tottenham Hotspur", "2005", "2007", appearances=44),
                stint(7, "ajax", "Ajax", "2007", "2008", appearances=34),
                stint(8, "crystal_palace", "Crystal Palace", "2010", "2010", appearances=7),
                stint(9, "barnet", "Barnet", "2012", "2014", appearances=38)
            ],
            provider_ids={"transfermarkt": "4158", "wikidata": "Q185115"}
        ),
        player(
            "patrick_kluivert", "Patrick Kluivert", "Patrick Stephan Kluivert",
            ["Kluivert", "Patrick Stephan Kluivert"],
            "1976-07-01", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "1994", "1997", appearances=100),
                stint(2, "acmilan", "AC Milan", "1997", "1998", appearances=33),
                stint(3, "fcb", "Barcelona", "1998", "2004", appearances=257),
                stint(4, "newcastle", "Newcastle United", "2004", "2005", appearances=37),
                stint(5, "valencia", "Valencia", "2005", "2006", appearances=16),
                stint(6, "psv_eindhoven", "PSV Eindhoven", "2006", "2007", appearances=21),
                stint(7, "lille", "Lille", "2007", "2008", appearances=14)
            ],
            provider_ids={"transfermarkt": "3441", "wikidata": "Q216932"}
        ),
        player(
            "robin_van_persie", "Robin van Persie", "Robin van Persie",
            ["Van Persie", "RVP"],
            "1983-08-06", ["Netherlands"], "retired",
            [
                stint(1, "feyenoord", "Feyenoord", "2001", "2004", appearances=78),
                stint(2, "afc", "Arsenal", "2004", "2012", appearances=278),
                stint(3, "manu", "Manchester United", "2012", "2015", appearances=105),
                stint(4, "fenerbahce", "Fenerbahçe", "2015", "2018", appearances=87),
                stint(5, "feyenoord", "Feyenoord", "2018", "2019", appearances=43)
            ],
            provider_ids={"transfermarkt": "4380", "wikidata": "Q164741"}
        ),
        player(
            "ruud_van_nistelrooy", "Ruud van Nistelrooy", "Rutgerus Johannes Martinus van Nistelrooij",
            ["Van Nistelrooy", "Van Nistelrooij", "Rutgerus Johannes Martinus van Nistelrooy"],
            "1976-07-01", ["Netherlands"], "retired",
            [
                stint(1, "den_bosch", "FC Den Bosch", "1993", "1997", appearances=71),
                stint(2, "heerenveen", "Heerenveen", "1997", "1998", appearances=36),
                stint(3, "psv_eindhoven", "PSV Eindhoven", "1998", "2001", appearances=91),
                stint(4, "manu", "Manchester United", "2001", "2006", appearances=219),
                stint(5, "rmcf", "Real Madrid", "2006", "2010", appearances=96),
                stint(6, "hamburger_sv", "Hamburger SV", "2010", "2011", appearances=44),
                stint(7, "malaga", "Málaga", "2011", "2012", appearances=32)
            ],
            provider_ids={"transfermarkt": "3407", "wikidata": "Q45648"}
        ),
        player(
            "edwin_van_der_sar", "Edwin van der Sar", "Edwin van der Sar",
            ["Van der Sar", "The Flying Dutchman"],
            "1970-10-29", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "1990", "1999", appearances=312),
                stint(2, "juve", "Juventus", "1999", "2001", appearances=88),
                stint(3, "fulham", "Fulham", "2001", "2005", appearances=154),
                stint(4, "manu", "Manchester United", "2005", "2011", appearances=266),
                stint(5, "noordwijk", "VV Noordwijk", "2016", "2016", appearances=1)
            ],
            provider_ids={"transfermarkt": "3510", "wikidata": "Q184915"},
            conflict_resolutions=[{"stintOrFact": "VV Noordwijk 2016 appearance", "sourcesExamined": ["KNVB records", "VV Noordwijk official"], "resolution": "Came out of retirement for one official fourth-tier Hoofdklasse match on 12 Mar 2016 due to an injury crisis, saving a penalty."}]
        ),
        player(
            "jaap_stam", "Jaap Stam", "Jakob Stam",
            ["Stam", "Jakob Stam", "The Rock of Kampen"],
            "1972-07-17", ["Netherlands"], "retired",
            [
                stint(1, "zwolle", "FC Zwolle", "1992", "1993", appearances=33),
                stint(2, "cambuur", "Cambuur", "1993", "1995", appearances=66),
                stint(3, "willem_ii", "Willem II", "1995", "1995", appearances=19),
                stint(4, "psv_eindhoven", "PSV Eindhoven", "1996", "1998", appearances=98),
                stint(5, "manu", "Manchester United", "1998", "2001", appearances=127),
                stint(6, "lazio", "Lazio", "2001", "2004", appearances=94),
                stint(7, "acmilan", "AC Milan", "2004", "2006", appearances=65),
                stint(8, "ajax", "Ajax", "2006", "2007", appearances=52)
            ],
            provider_ids={"transfermarkt": "3562", "wikidata": "Q216900"}
        ),
        player(
            "marc_overmars", "Marc Overmars", "Marc Overmars",
            ["Overmars", "The Roadrunner"],
            "1973-03-29", ["Netherlands"], "retired",
            [
                stint(1, "go_ahead_eagles", "Go Ahead Eagles", "1990", "1991", appearances=32),
                stint(2, "willem_ii", "Willem II", "1991", "1992", appearances=31),
                stint(3, "ajax", "Ajax", "1992", "1997", appearances=193),
                stint(4, "afc", "Arsenal", "1997", "2000", appearances=141),
                stint(5, "fcb", "Barcelona", "2000", "2004", appearances=142),
                stint(6, "go_ahead_eagles", "Go Ahead Eagles", "2008", "2009", appearances=25)
            ],
            provider_ids={"transfermarkt": "3513", "wikidata": "Q217277"}
        ),
        player(
            "wesley_sneijder", "Wesley Sneijder", "Wesley Sneijder",
            ["Sneijder"],
            "1984-06-09", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "2002", "2007", appearances=180),
                stint(2, "rmcf", "Real Madrid", "2007", "2009", appearances=66),
                stint(3, "inter", "Inter Milan", "2009", "2013", appearances=116),
                stint(4, "galatasaray", "Galatasaray", "2013", "2017", appearances=175),
                stint(5, "nice", "Nice", "2017", "2018", appearances=8),
                stint(6, "al_gharafa", "Al-Gharafa", "2018", "2019", appearances=29)
            ],
            provider_ids={"transfermarkt": "4673", "wikidata": "Q164724"}
        ),
        player(
            "rafael_van_der_vaart", "Rafael van der Vaart", "Rafael Ferdinand van der Vaart",
            ["Van der Vaart", "Rafa", "Rafael Ferdinand van der Vaart"],
            "1983-02-11", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "2000", "2005", appearances=156),
                stint(2, "hamburger_sv", "Hamburger SV", "2005", "2008", appearances=113),
                stint(3, "rmcf", "Real Madrid", "2008", "2010", appearances=73),
                stint(4, "tottenham", "Tottenham Hotspur", "2010", "2012", appearances=77),
                stint(5, "hamburger_sv", "Hamburger SV", "2012", "2015", appearances=86),
                stint(6, "real_betis", "Real Betis", "2015", "2016", appearances=9),
                stint(7, "midtjylland", "Midtjylland", "2016", "2018", appearances=20),
                stint(8, "esbjerg", "Esbjerg", "2018", "2018", appearances=4)
            ],
            provider_ids={"transfermarkt": "4164", "wikidata": "Q179607"}
        ),
        player(
            "dirk_kuyt", "Dirk Kuyt", "Dirk Kuijt",
            ["Kuyt", "Kuijt", "Dirk Kuijt"],
            "1980-07-22", ["Netherlands"], "retired",
            [
                stint(1, "utrecht", "FC Utrecht", "1998", "2003", appearances=184),
                stint(2, "feyenoord", "Feyenoord", "2003", "2006", appearances=122),
                stint(3, "lfc", "Liverpool", "2006", "2012", appearances=285),
                stint(4, "fenerbahce", "Fenerbahçe", "2012", "2015", appearances=130),
                stint(5, "feyenoord", "Feyenoord", "2015", "2017", appearances=76),
                stint(6, "quick_boys", "Quick Boys", "2018", "2018", appearances=3)
            ],
            provider_ids={"transfermarkt": "4010", "wikidata": "Q174827"}
        ),
        player(
            "giovanni_van_bronckhorst", "Giovanni van Bronckhorst", "Giovanni Christiaan van Bronckhorst",
            ["Van Bronckhorst", "Gio", "Giovanni Christiaan van Bronckhorst"],
            "1975-02-05", ["Netherlands"], "retired",
            [
                stint(1, "rkc_waalwijk", "RKC Waalwijk", "1993", "1994", appearances=12, stint_type="loan"),
                stint(2, "feyenoord", "Feyenoord", "1994", "1998", appearances=126),
                stint(3, "rangers", "Rangers", "1998", "2001", appearances=118),
                stint(4, "afc", "Arsenal", "2001", "2003", appearances=64),
                stint(5, "fcb", "Barcelona", "2003", "2007", appearances=155),
                stint(6, "feyenoord", "Feyenoord", "2007", "2010", appearances=85)
            ],
            provider_ids={"transfermarkt": "3186", "wikidata": "Q179553"}
        ),
        player(
            "phillip_cocu", "Phillip Cocu", "Phillip John-William Cocu",
            ["Cocu", "Phillip John-William Cocu"],
            "1970-10-29", ["Netherlands"], "retired",
            [
                stint(1, "az", "AZ", "1988", "1990", appearances=50),
                stint(2, "vitesse", "Vitesse", "1990", "1995", appearances=153),
                stint(3, "psv_eindhoven", "PSV Eindhoven", "1995", "1998", appearances=125),
                stint(4, "fcb", "Barcelona", "1998", "2004", appearances=292),
                stint(5, "psv_eindhoven", "PSV Eindhoven", "2004", "2007", appearances=122),
                stint(6, "al_jazira", "Al Jazira", "2007", "2008", appearances=17)
            ],
            provider_ids={"transfermarkt": "3143", "wikidata": "Q216898"}
        ),
        player(
            "frank_de_boer", "Frank de Boer", "Franciscus de Boer",
            ["Frank de Boer", "Franciscus de Boer"],
            "1970-05-15", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "1988", "1999", appearances=434),
                stint(2, "fcb", "Barcelona", "1999", "2003", appearances=214),
                stint(3, "galatasaray", "Galatasaray", "2003", "2004", appearances=23),
                stint(4, "rangers", "Rangers", "2004", "2004", appearances=17),
                stint(5, "al_rayyan", "Al-Rayyan", "2004", "2005", appearances=16),
                stint(6, "al_shamal", "Al-Shamal", "2005", "2006", appearances=1)
            ],
            provider_ids={"transfermarkt": "3519", "wikidata": "Q206121"}
        ),
        player(
            "ronald_de_boer", "Ronald de Boer", "Ronaldus de Boer",
            ["Ronald de Boer", "Ronaldus de Boer"],
            "1970-05-15", ["Netherlands"], "retired",
            [
                stint(1, "ajax", "Ajax", "1987", "1991", appearances=64),
                stint(2, "twente", "FC Twente", "1991", "1993", appearances=56),
                stint(3, "ajax", "Ajax", "1993", "1999", appearances=270),
                stint(4, "fcb", "Barcelona", "1999", "2000", appearances=55),
                stint(5, "rangers", "Rangers", "2000", "2004", appearances=129),
                stint(6, "al_rayyan", "Al-Rayyan", "2004", "2005", appearances=22),
                stint(7, "al_shamal", "Al-Shamal", "2005", "2008", appearances=56)
            ],
            provider_ids={"transfermarkt": "3520", "wikidata": "Q206124"}
        ),
        player(
            "michael_laudrup", "Michael Laudrup", "Michael Laudrup",
            ["Laudrup", "Michael"],
            "1964-06-15", ["Denmark"], "retired",
            [
                stint(1, "kb", "KB", "1981", "1981", appearances=14),
                stint(2, "brondby", "Brøndby", "1982", "1983", appearances=38),
                stint(3, "lazio", "Lazio", "1983", "1985", appearances=60, stint_type="loan"),
                stint(4, "juve", "Juventus", "1985", "1989", appearances=138),
                stint(5, "fcb", "Barcelona", "1989", "1994", appearances=288),
                stint(6, "rmcf", "Real Madrid", "1994", "1996", appearances=76),
                stint(7, "vissel_kobe", "Vissel Kobe", "1996", "1997", appearances=15),
                stint(8, "ajax", "Ajax", "1997", "1998", appearances=38)
            ],
            provider_ids={"transfermarkt": "8025", "wikidata": "Q188720"}
        ),
        player(
            "brian_laudrup", "Brian Laudrup", "Brian Laudrup",
            ["Brian Laudrup"],
            "1969-02-22", ["Denmark"], "retired",
            [
                stint(1, "brondby", "Brøndby", "1986", "1989", appearances=68),
                stint(2, "bayer_uerdingen", "Bayer Uerdingen", "1989", "1990", appearances=34),
                stint(3, "bayern", "Bayern Munich", "1990", "1992", appearances=62),
                stint(4, "fiorentina", "Fiorentina", "1992", "1993", appearances=35),
                stint(5, "acmilan", "AC Milan", "1993", "1994", appearances=18, stint_type="loan"),
                stint(6, "rangers", "Rangers", "1994", "1998", appearances=150),
                stint(7, "cfc", "Chelsea", "1998", "1998", appearances=11),
                stint(8, "copenhagen", "FC Copenhagen", "1999", "1999", appearances=12),
                stint(9, "ajax", "Ajax", "1999", "2000", appearances=38)
            ],
            provider_ids={"transfermarkt": "39667", "wikidata": "Q216892"}
        ),
        player(
            "peter_schmeichel", "Peter Schmeichel", "Peter Bolesław Schmeichel",
            ["Schmeichel", "The Great Dane", "Peter Boleslaw Schmeichel"],
            "1963-11-18", ["Denmark"], "retired",
            [
                stint(1, "gladsaxe_hero", "Gladsaxe-Hero", "1981", "1984", appearances=46),
                stint(2, "hvidovre", "Hvidovre", "1984", "1987", appearances=88),
                stint(3, "brondby", "Brøndby", "1987", "1991", appearances=156),
                stint(4, "manu", "Manchester United", "1991", "1999", appearances=398),
                stint(5, "sporting", "Sporting CP", "1999", "2001", appearances=66),
                stint(6, "aston_villa", "Aston Villa", "2001", "2002", appearances=36),
                stint(7, "mancity", "Manchester City", "2002", "2003", appearances=31)
            ],
            provider_ids={"transfermarkt": "3468", "wikidata": "Q174836"}
        ),
        player(
            "jon_dahl_tomasson", "Jon Dahl Tomasson", "Jon Dahl Tomasson",
            ["Tomasson", "Jon Dahl"],
            "1976-08-29", ["Denmark"], "retired",
            [
                stint(1, "koge", "Køge", "1992", "1994", appearances=55),
                stint(2, "heerenveen", "Heerenveen", "1994", "1997", appearances=87),
                stint(3, "newcastle", "Newcastle United", "1997", "1998", appearances=35),
                stint(4, "feyenoord", "Feyenoord", "1998", "2002", appearances=159),
                stint(5, "acmilan", "AC Milan", "2002", "2005", appearances=114),
                stint(6, "stuttgart", "VfB Stuttgart", "2005", "2007", appearances=38),
                stint(7, "villarreal", "Villarreal", "2007", "2008", appearances=41),
                stint(8, "feyenoord", "Feyenoord", "2008", "2011", appearances=48)
            ],
            provider_ids={"transfermarkt": "3472", "wikidata": "Q216912"}
        ),
        player(
            "henrik_larsson", "Henrik Larsson", "Henrik Edward Larsson",
            ["Larsson", "Henke", "Henrik Edward Larsson"],
            "1971-09-20", ["Sweden"], "retired",
            [
                stint(1, "hogaborg", "Högaborg", "1989", "1992", appearances=74),
                stint(2, "helsingborg", "Helsingborg", "1992", "1993", appearances=61),
                stint(3, "feyenoord", "Feyenoord", "1993", "1997", appearances=149),
                stint(4, "celtic", "Celtic", "1997", "2004", appearances=315),
                stint(5, "fcb", "Barcelona", "2004", "2006", appearances=59),
                stint(6, "helsingborg", "Helsingborg", "2006", "2007", appearances=30),
                stint(7, "manu", "Manchester United", "2007", "2007", appearances=13, stint_type="loan"),
                stint(8, "helsingborg", "Helsingborg", "2007", "2009", appearances=76),
                stint(9, "raa", "Råå IF", "2012", "2012", appearances=1),
                stint(10, "hogaborg", "Högaborg", "2013", "2013", appearances=2)
            ],
            provider_ids={"transfermarkt": "3464", "wikidata": "Q185124"}
        ),
        player(
            "freddie_ljungberg", "Freddie Ljungberg", "Karl Fredrik Ljungberg",
            ["Ljungberg", "Fredrik Ljungberg", "Karl Fredrik Ljungberg"],
            "1977-04-16", ["Sweden"], "retired",
            [
                stint(1, "halmstad", "Halmstad", "1994", "1998", appearances=97),
                stint(2, "afc", "Arsenal", "1998", "2007", appearances=328),
                stint(3, "west_ham", "West Ham United", "2007", "2008", appearances=28),
                stint(4, "seattle_sounders", "Seattle Sounders", "2009", "2010", appearances=49),
                stint(5, "chicago_fire", "Chicago Fire", "2010", "2010", appearances=15),
                stint(6, "celtic", "Celtic", "2011", "2011", appearances=8),
                stint(7, "shimizu_s_pulse", "Shimizu S-Pulse", "2011", "2012", appearances=11),
                stint(8, "mumbai_city", "Mumbai City", "2014", "2014", appearances=4)
            ],
            provider_ids={"transfermarkt": "3182", "wikidata": "Q179555"}
        ),
        player(
            "jari_litmanen", "Jari Litmanen", "Jari Olavi Litmanen",
            ["Litmanen", "Kuningas", "The King", "Jari Olavi Litmanen"],
            "1971-02-20", ["Finland"], "retired",
            [
                stint(1, "reipas_lahti", "Reipas Lahti", "1987", "1990", appearances=86),
                stint(2, "hjk_helsinki", "HJK Helsinki", "1991", "1991", appearances=27),
                stint(3, "mypa", "MyPa", "1992", "1992", appearances=18),
                stint(4, "ajax", "Ajax", "1992", "1999", appearances=255),
                stint(5, "fcb", "Barcelona", "1999", "2001", appearances=32),
                stint(6, "lfc", "Liverpool", "2001", "2002", appearances=43),
                stint(7, "ajax", "Ajax", "2002", "2004", appearances=31),
                stint(8, "fc_lahti", "FC Lahti", "2004", "2004", appearances=11),
                stint(9, "hansa_rostock", "Hansa Rostock", "2005", "2005", appearances=14),
                stint(10, "malmo_ff", "Malmö FF", "2005", "2007", appearances=10),
                stint(11, "fc_lahti", "FC Lahti", "2008", "2010", appearances=40),
                stint(12, "hjk_helsinki", "HJK Helsinki", "2011", "2011", appearances=20)
            ],
            provider_ids={"transfermarkt": "3142", "wikidata": "Q185128"},
            exclusions=[{"club": "Fulham", "reason": "unused-loan", "evidence": "Signed for Fulham in Jan 2008 on free transfer; suffered heart-rate issues and made 0 competitive appearances for the first team before contract expired in May 2008."}]
        ),
        player(
            "eidur_gudjohnsen", "Eiður Guðjohnsen", "Eiður Smári Guðjohnsen",
            ["Gudjohnsen", "Eidur Gudjohnsen", "Eidur Smari Gudjohnsen"],
            "1978-09-15", ["Iceland"], "retired",
            [
                stint(1, "valur", "Valur", "1994", "1994", appearances=22),
                stint(2, "psv_eindhoven", "PSV Eindhoven", "1995", "1997", appearances=15),
                stint(3, "kr_reykjavik", "KR Reykjavík", "1998", "1998", appearances=8),
                stint(4, "bolton_wanderers", "Bolton Wanderers", "1998", "2000", appearances=73),
                stint(5, "cfc", "Chelsea", "2000", "2006", appearances=263),
                stint(6, "fcb", "Barcelona", "2006", "2009", appearances=114),
                stint(7, "monaco", "Monaco", "2009", "2010", appearances=11),
                stint(8, "tottenham", "Tottenham Hotspur", "2010", "2010", appearances=14, stint_type="loan"),
                stint(9, "stoke_city", "Stoke City", "2010", "2011", appearances=5),
                stint(10, "fulham", "Fulham", "2011", "2011", appearances=10, stint_type="loan"),
                stint(11, "aek_athens", "AEK Athens", "2011", "2012", appearances=14),
                stint(12, "cercle_brugge", "Cercle Brugge", "2012", "2013", appearances=14),
                stint(13, "club_brugge", "Club Brugge", "2013", "2014", appearances=36),
                stint(14, "bolton_wanderers", "Bolton Wanderers", "2014", "2015", appearances=24),
                stint(15, "shijiazhuang", "Shijiazhuang Ever Bright", "2015", "2015", appearances=14),
                stint(16, "molde", "Molde", "2016", "2016", appearances=13),
                stint(17, "pune_city", "FC Pune City", "2016", "2016", appearances=1)
            ],
            provider_ids={"transfermarkt": "3176", "wikidata": "Q179619"}
        ),
        player(
            "dimitar_berbatov", "Dimitar Berbatov", "Dimitar Ivanov Berbatov",
            ["Berbatov", "Berba", "Dimitar Ivanov Berbatov"],
            "1981-01-30", ["Bulgaria"], "retired",
            [
                stint(1, "pirin_blagoevgrad", "Pirin Blagoevgrad", "1998", "1999", appearances=9),
                stint(2, "cska_sofia", "CSKA Sofia", "1999", "2001", appearances=65),
                stint(3, "leverkusen", "Bayer Leverkusen", "2001", "2006", appearances=202),
                stint(4, "tottenham", "Tottenham Hotspur", "2006", "2008", appearances=102),
                stint(5, "manu", "Manchester United", "2008", "2012", appearances=149),
                stint(6, "fulham", "Fulham", "2012", "2014", appearances=54),
                stint(7, "monaco", "Monaco", "2014", "2015", appearances=53),
                stint(8, "paok", "PAOK", "2015", "2016", appearances=25),
                stint(9, "kerala_blasters", "Kerala Blasters", "2017", "2018", appearances=9)
            ],
            provider_ids={"transfermarkt": "65", "wikidata": "Q484433"}
        ),
        player(
            "petr_cech", "Petr Čech", "Petr Čech",
            ["Cech", "Petr Cech", "Big Pete"],
            "1982-05-20", ["Czech Republic"], "retired",
            [
                stint(1, "chmel_blsany", "Chmel Blšany", "1999", "2001", appearances=28),
                stint(2, "sparta_prague", "Sparta Prague", "2001", "2002", appearances=42),
                stint(3, "rennes", "Rennes", "2002", "2004", appearances=78),
                stint(4, "cfc", "Chelsea", "2004", "2015", appearances=494),
                stint(5, "afc", "Arsenal", "2015", "2019", appearances=139)
            ],
            provider_ids={"transfermarkt": "5658", "wikidata": "Q174826"}
        ),
        player(
            "pavel_nedved", "Pavel Nedvěd", "Pavel Nedvěd",
            ["Nedved", "The Czech Cannon", "Pavel Nedved"],
            "1972-08-30", ["Czech Republic"], "retired",
            [
                stint(1, "dukla_prague", "Dukla Prague", "1991", "1992", appearances=19),
                stint(2, "sparta_prague", "Sparta Prague", "1992", "1996", appearances=117),
                stint(3, "lazio", "Lazio", "1996", "2001", appearances=207),
                stint(4, "juve", "Juventus", "2001", "2009", appearances=327)
            ],
            provider_ids={"transfermarkt": "3603", "wikidata": "Q171500"}
        ),
        player(
            "tomas_rosicky", "Tomáš Rosický", "Tomáš Rosický",
            ["Rosicky", "The Little Mozart", "Tomas Rosicky"],
            "1980-10-04", ["Czech Republic"], "retired",
            [
                stint(1, "sparta_prague", "Sparta Prague", "1998", "2001", appearances=65),
                stint(2, "bvb", "Borussia Dortmund", "2001", "2006", appearances=189),
                stint(3, "afc", "Arsenal", "2006", "2016", appearances=246),
                stint(4, "sparta_prague", "Sparta Prague", "2016", "2017", appearances=13)
            ],
            provider_ids={"transfermarkt": "132", "wikidata": "Q185121"}
        ),
        player(
            "milan_baros", "Milan Baroš", "Milan Baroš",
            ["Baros", "Milan Baros"],
            "1981-10-28", ["Czech Republic"], "retired",
            [
                stint(1, "banik_ostrava", "Baník Ostrava", "1998", "2001", appearances=76),
                stint(2, "lfc", "Liverpool", "2002", "2005", appearances=108),
                stint(3, "aston_villa", "Aston Villa", "2005", "2007", appearances=51),
                stint(4, "lyon", "Lyon", "2007", "2008", appearances=30),
                stint(5, "portsmouth", "Portsmouth", "2008", "2008", appearances=16, stint_type="loan"),
                stint(6, "galatasaray", "Galatasaray", "2008", "2013", appearances=116),
                stint(7, "banik_ostrava", "Baník Ostrava", "2013", "2013", appearances=12),
                stint(8, "antalyaspor", "Antalyaspor", "2013", "2014", appearances=16),
                stint(9, "banik_ostrava", "Baník Ostrava", "2014", "2015", appearances=11),
                stint(10, "mlada_boleslav", "Mladá Boleslav", "2015", "2016", appearances=24),
                stint(11, "slovan_liberec", "Slovan Liberec", "2016", "2017", appearances=25),
                stint(12, "banik_ostrava", "Baník Ostrava", "2017", "2020", appearances=64),
                stint(13, "vigantice", "FK Vigantice", "2020", "2022", appearances=15)
            ],
            provider_ids={"transfermarkt": "3215", "wikidata": "Q185119"}
        ),
        player(
            "jan_koller", "Jan Koller", "Jan Koller",
            ["Koller", "Dino"],
            "1973-03-30", ["Czech Republic"], "retired",
            [
                stint(1, "sparta_prague", "Sparta Prague", "1994", "1996", appearances=34),
                stint(2, "lokeren", "Lokeren", "1996", "1999", appearances=102),
                stint(3, "anderlecht", "Anderlecht", "1999", "2001", appearances=85),
                stint(4, "bvb", "Borussia Dortmund", "2001", "2006", appearances=182),
                stint(5, "monaco", "Monaco", "2006", "2008", appearances=54),
                stint(6, "nurnberg", "1. FC Nürnberg", "2008", "2008", appearances=16),
                stint(7, "krylia_sovetov", "Krylia Sovetov", "2008", "2009", appearances=47),
                stint(8, "cannes", "Cannes", "2010", "2011", appearances=48)
            ],
            provider_ids={"transfermarkt": "1152", "wikidata": "Q185122"}
        ),
        player(
            "marek_hamsik", "Marek Hamšík", "Marek Hamšík",
            ["Hamsik", "Marek Hamsik", "Marekiaro"],
            "1987-07-27", ["Slovakia"], "retired",
            [
                stint(1, "slovan_bratislava", "Slovan Bratislava", "2004", "2004", appearances=6),
                stint(2, "brescia", "Brescia", "2004", "2007", appearances=74),
                stint(3, "napoli", "Napoli", "2007", "2019", appearances=520),
                stint(4, "dalian_pro", "Dalian Professional", "2019", "2021", appearances=45),
                stint(5, "ifk_goteborg", "IFK Göteborg", "2021", "2021", appearances=6),
                stint(6, "trabzonspor", "Trabzonspor", "2021", "2023", appearances=65)
            ],
            provider_ids={"transfermarkt": "43261", "wikidata": "Q185127"}
        )
    ]
    
    assert len(players) == 120, f"Expected 120 players in batch 1, got {len(players)}"
    return players
