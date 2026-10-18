"""
Generator script for Journeyman Player Data Batch 3 (Players 211 to 300: 90 players).
Covers legendary South American icons, African pioneers, Asian & CONCACAF trailblazers,
and global football immortals.
"""
import sys
import os

sys.path.append(os.path.dirname(__file__))
from player_builder_helpers import player, stint

def generate():
    players = [
        # 211. Cafu
        player(
            "cafu", "Cafu", "Marcos Evangelista de Moraes",
            ["Marcos Evangelista de Moraes", "Il Pendolino"],
            "1970-06-07", ["Brazil"], "retired",
            [
                stint(1, "sao_paulo", "São Paulo", "1989", "1994", appearances=115),
                stint(2, "juventude", "Juventude", "1995", "1995", appearances=2),
                stint(3, "zaragoza", "Real Zaragoza", "1995", "1995", appearances=16),
                stint(4, "palmeiras", "Palmeiras", "1995", "1997", appearances=99),
                stint(5, "roma", "Roma", "1997", "2003", appearances=166),
                stint(6, "acmilan", "AC Milan", "2003", "2008", appearances=119)
            ],
            provider_ids={"transfermarkt": "5957", "wikidata": "Q178668"},
            career_complete=True
        ),
        # 212. Roberto Carlos
        player(
            "roberto_carlos", "Roberto Carlos", "Roberto Carlos da Silva Rocha",
            ["Roberto Carlos da Silva Rocha", "El Hombre Bala"],
            "1973-04-10", ["Brazil"], "retired",
            [
                stint(1, "uniao_sao_joao", "União São João", "1991", "1992", appearances=33),
                stint(2, "palmeiras", "Palmeiras", "1993", "1995", appearances=78),
                stint(3, "inter", "Inter Milan", "1995", "1996", appearances=30),
                stint(4, "rmcf", "Real Madrid", "1996", "2007", appearances=527),
                stint(5, "fenerbahce", "Fenerbahçe", "2007", "2009", appearances=65),
                stint(6, "corinthians", "Corinthians", "2010", "2011", appearances=35),
                stint(7, "anzhi", "Anzhi Makhachkala", "2011", "2012", appearances=25),
                stint(8, "delhi_dynamos", "Delhi Dynamos", "2015", "2015", appearances=3)
            ],
            provider_ids={"transfermarkt": "7518", "wikidata": "Q483012"},
            career_complete=True
        ),
        # 213. Bebeto
        player(
            "bebeto", "Bebeto", "José Roberto Gama de Oliveira",
            ["Jose Roberto Gama de Oliveira"],
            "1964-02-16", ["Brazil"], "retired",
            [
                stint(1, "vitoria", "Vitória", "1982", "1983", appearances=0),
                stint(2, "flamengo", "Flamengo", "1983", "1989", appearances=80),
                stint(3, "vasco_da_gama", "Vasco da Gama", "1989", "1992", appearances=53),
                stint(4, "deportivo", "Deportivo La Coruña", "1992", "1996", appearances=131),
                stint(5, "flamengo", "Flamengo", "1996", "1996", appearances=15),
                stint(6, "sevilla", "Sevilla", "1996", "1997", appearances=5),
                stint(7, "vitoria", "Vitória", "1997", "1997", appearances=8),
                stint(8, "botafogo", "Botafogo", "1998", "1999", appearances=17),
                stint(9, "toros_neza", "Toros Neza", "1999", "1999", appearances=8),
                stint(10, "kashima_antlers", "Kashima Antlers", "2000", "2000", appearances=8),
                stint(11, "vasco_da_gama", "Vasco da Gama", "2001", "2001", appearances=8),
                stint(12, "al_ittihad", "Al-Ittihad", "2002", "2002", appearances=5)
            ],
            provider_ids={"transfermarkt": "102587", "wikidata": "Q204828"},
            career_complete=True
        ),
        # 214. Dunga
        player(
            "dunga", "Dunga", "Carlos Caetano Bledorn Verri",
            ["Carlos Caetano Bledorn Verri"],
            "1963-10-31", ["Brazil"], "retired",
            [
                stint(1, "internacional", "Internacional", "1980", "1984", appearances=10),
                stint(2, "corinthians", "Corinthians", "1984", "1985", appearances=13),
                stint(3, "santos", "Santos", "1985", "1987", appearances=16),
                stint(4, "vasco_da_gama", "Vasco da Gama", "1987", "1987", appearances=17),
                stint(5, "pisa", "Pisa", "1987", "1988", appearances=23),
                stint(6, "fiorentina", "Fiorentina", "1988", "1992", appearances=124),
                stint(7, "pescara", "Pescara", "1992", "1993", appearances=23),
                stint(8, "stuttgart", "VfB Stuttgart", "1993", "1995", appearances=54),
                stint(9, "jubilo_iwata", "Júbilo Iwata", "1995", "1998", appearances=99),
                stint(10, "internacional", "Internacional", "1999", "2000", appearances=15)
            ],
            provider_ids={"transfermarkt": "96342", "wikidata": "Q215444"},
            career_complete=True
        ),
        # 215. Zico
        player(
            "zico", "Zico", "Arthur Antunes Coimbra",
            ["Arthur Antunes Coimbra", "White Pele"],
            "1953-03-03", ["Brazil"], "retired",
            [
                stint(1, "flamengo", "Flamengo", "1971", "1983", appearances=212),
                stint(2, "udinese", "Udinese", "1983", "1985", appearances=39),
                stint(3, "flamengo", "Flamengo", "1985", "1989", appearances=37),
                stint(4, "kashima_antlers", "Kashima Antlers", "1991", "1994", appearances=45)
            ],
            provider_ids={"transfermarkt": "80444", "wikidata": "Q47526"},
            career_complete=True
        ),
        # 216. Sócrates
        player(
            "socrates", "Sócrates", "Sócrates Brasileiro Sampaio de Souza Vieira de Oliveira",
            ["Dr. Socrates", "Socrates"],
            "1954-02-19", ["Brazil"], "retired",
            [
                stint(1, "botafogo_sp", "Botafogo-SP", "1974", "1978", appearances=57),
                stint(2, "corinthians", "Corinthians", "1978", "1984", appearances=298),
                stint(3, "fiorentina", "Fiorentina", "1984", "1985", appearances=25),
                stint(4, "flamengo", "Flamengo", "1986", "1987", appearances=11),
                stint(5, "santos", "Santos", "1988", "1989", appearances=25),
                stint(6, "botafogo_sp", "Botafogo-SP", "1989", "1989", appearances=0),
                stint(7, "garforth_town", "Garforth Town", "2004", "2004", appearances=1)
            ],
            provider_ids={"transfermarkt": "117666", "wikidata": "Q102334"},
            career_complete=True
        ),
        # 217. Paulo Roberto Falcão
        player(
            "falcao", "Paulo Roberto Falcão", "Paulo Roberto Falcão",
            ["Falcao", "Paulo Roberto Falcao", "Eighth King of Rome"],
            "1953-10-16", ["Brazil"], "retired",
            [
                stint(1, "internacional", "Internacional", "1973", "1980", appearances=158),
                stint(2, "roma", "Roma", "1980", "1985", appearances=107),
                stint(3, "sao_paulo", "São Paulo", "1985", "1986", appearances=10)
            ],
            provider_ids={"transfermarkt": "117621", "wikidata": "Q294520"},
            career_complete=True
        ),
        # 218. Júnior
        player(
            "junior", "Júnior", "Leovegildo Lins da Gama Júnior",
            ["Leovegildo Lins da Gama Junior", "Junior"],
            "1954-06-29", ["Brazil"], "retired",
            [
                stint(1, "flamengo", "Flamengo", "1974", "1984", appearances=198),
                stint(2, "torino", "Torino", "1984", "1987", appearances=86),
                stint(3, "pescara", "Pescara", "1987", "1989", appearances=62),
                stint(4, "flamengo", "Flamengo", "1989", "1993", appearances=67)
            ],
            provider_ids={"transfermarkt": "117623", "wikidata": "Q353147"},
            career_complete=True
        ),
        # 219. Careca
        player(
            "careca", "Careca", "Antônio de Oliveira Filho",
            ["Antonio de Oliveira Filho"],
            "1960-10-05", ["Brazil"], "retired",
            [
                stint(1, "guarani", "Guarani", "1978", "1982", appearances=77),
                stint(2, "sao_paulo", "São Paulo", "1983", "1987", appearances=67),
                stint(3, "napoli", "Napoli", "1987", "1993", appearances=164),
                stint(4, "kashiwa_reysol", "Kashiwa Reysol", "1993", "1996", appearances=60),
                stint(5, "santos", "Santos", "1997", "1997", appearances=9)
            ],
            provider_ids={"transfermarkt": "117626", "wikidata": "Q312482"},
            career_complete=True
        ),
        # 220. Carlos Alberto Torres
        player(
            "carlos_alberto", "Carlos Alberto", "Carlos Alberto Torres",
            ["Carlos Alberto Torres", "O Capitao"],
            "1944-07-17", ["Brazil"], "retired",
            [
                stint(1, "fluminense", "Fluminense", "1963", "1966", appearances=48),
                stint(2, "santos", "Santos", "1966", "1974", appearances=445),
                stint(3, "botafogo", "Botafogo", "1971", "1971", appearances=0, stint_type="loan"),
                stint(4, "fluminense", "Fluminense", "1974", "1977", appearances=53),
                stint(5, "flamengo", "Flamengo", "1977", "1977", appearances=0),
                stint(6, "ny_cosmos", "New York Cosmos", "1977", "1980", appearances=80),
                stint(7, "california_surf", "California Surf", "1981", "1981", appearances=19),
                stint(8, "ny_cosmos", "New York Cosmos", "1982", "1982", appearances=19)
            ],
            provider_ids={"transfermarkt": "145517", "wikidata": "Q234440"},
            career_complete=True
        ),
        # 221. Garrincha
        player(
            "garrincha", "Garrincha", "Manuel Francisco dos Santos",
            ["Manuel Francisco dos Santos", "Mane Garrincha", "The Joy of the People"],
            "1933-10-28", ["Brazil"], "retired",
            [
                stint(1, "botafogo", "Botafogo", "1953", "1965", appearances=581),
                stint(2, "corinthians", "Corinthians", "1966", "1966", appearances=10),
                stint(3, "portuguesa_santista", "Portuguesa Santista", "1967", "1967", appearances=1),
                stint(4, "junior", "Junior", "1968", "1968", appearances=1),
                stint(5, "flamengo", "Flamengo", "1968", "1969", appearances=15),
                stint(6, "olaria", "Olaria", "1972", "1972", appearances=8)
            ],
            provider_ids={"transfermarkt": "151241", "wikidata": "Q180642"},
            career_complete=True
        ),
        # 222. Jairzinho
        player(
            "jairzinho", "Jairzinho", "Jair Ventura Filho",
            ["Jair Ventura Filho", "The Hurricane"],
            "1944-12-25", ["Brazil"], "retired",
            [
                stint(1, "botafogo", "Botafogo", "1959", "1974", appearances=413),
                stint(2, "marseille", "Marseille", "1974", "1975", appearances=18),
                stint(3, "cruzeiro", "Cruzeiro", "1976", "1976", appearances=12),
                stint(4, "portuguesa", "Portuguesa", "1977", "1977", appearances=22),
                stint(5, "botafogo", "Botafogo", "1981", "1981", appearances=0),
                stint(6, "jorge_wilstermann", "Jorge Wilstermann", "1980", "1981", appearances=19)
            ],
            provider_ids={"transfermarkt": "229670", "wikidata": "Q210103"},
            career_complete=True
        ),
        # 223. Rivellino
        player(
            "rivellino", "Rivellino", "Roberto Rivellino",
            ["Roberto Rivellino", "Atomic Kick"],
            "1946-01-01", ["Brazil"], "retired",
            [
                stint(1, "corinthians", "Corinthians", "1965", "1974", appearances=474),
                stint(2, "fluminense", "Fluminense", "1975", "1978", appearances=158),
                stint(3, "al_hilal", "Al-Hilal", "1978", "1981", appearances=57)
            ],
            provider_ids={"transfermarkt": "145524", "wikidata": "Q219807"},
            career_complete=True
        ),
        # 224. Tostão
        player(
            "tostao", "Tostão", "Eduardo Gonçalves de Andrade",
            ["Eduardo Goncalves de Andrade", "Tostao"],
            "1947-01-25", ["Brazil"], "retired",
            [
                stint(1, "america_mg", "América Mineiro", "1962", "1963", appearances=26),
                stint(2, "cruzeiro", "Cruzeiro", "1963", "1972", appearances=378),
                stint(3, "vasco_da_gama", "Vasco da Gama", "1972", "1973", appearances=35)
            ],
            provider_ids={"transfermarkt": "151248", "wikidata": "Q205178"},
            career_complete=True
        ),
        # 225. Gérson
        player(
            "gerson", "Gérson", "Gérson de Oliveira Nunes",
            ["Gerson", "The Golden Left Foot"],
            "1941-01-11", ["Brazil"], "retired",
            [
                stint(1, "flamengo", "Flamengo", "1959", "1963", appearances=153),
                stint(2, "botafogo", "Botafogo", "1963", "1969", appearances=248),
                stint(3, "sao_paulo", "São Paulo", "1969", "1972", appearances=75),
                stint(4, "fluminense", "Fluminense", "1972", "1974", appearances=57)
            ],
            provider_ids={"transfermarkt": "229668", "wikidata": "Q312411"},
            career_complete=True
        ),
        # 226. Didi
        player(
            "didi", "Didi", "Waldyr Pereira",
            ["Waldyr Pereira", "The Ethiopian Prince"],
            "1928-10-08", ["Brazil"], "retired",
            [
                stint(1, "madureira", "Madureira", "1947", "1949", appearances=32),
                stint(2, "fluminense", "Fluminense", "1949", "1956", appearances=298),
                stint(3, "botafogo", "Botafogo", "1956", "1959", appearances=145),
                stint(4, "rmcf", "Real Madrid", "1959", "1960", appearances=19),
                stint(5, "botafogo", "Botafogo", "1960", "1962", appearances=98),
                stint(6, "sporting_cristal", "Sporting Cristal", "1962", "1963", appearances=20),
                stint(7, "sao_paulo", "São Paulo", "1964", "1964", appearances=12),
                stint(8, "veracruz", "Veracruz", "1965", "1966", appearances=29)
            ],
            provider_ids={"transfermarkt": "136544", "wikidata": "Q295484"},
            career_complete=True
        ),
        # 227. Nílton Santos
        player(
            "nilton_santos", "Nílton Santos", "Nílton dos Santos",
            ["Nilton dos Santos", "The Encyclopedia"],
            "1925-05-16", ["Brazil"], "retired",
            [
                stint(1, "botafogo", "Botafogo", "1948", "1964", appearances=718)
            ],
            provider_ids={"transfermarkt": "236118", "wikidata": "Q190243"},
            career_complete=True
        ),
        # 228. Djalma Santos
        player(
            "djalma_santos", "Djalma Santos", "Djalma Pereira Dias dos Santos",
            ["Djalma Pereira Dias dos Santos"],
            "1929-02-27", ["Brazil"], "retired",
            [
                stint(1, "portuguesa", "Portuguesa", "1948", "1959", appearances=434),
                stint(2, "palmeiras", "Palmeiras", "1959", "1968", appearances=498),
                stint(3, "athletico_paranaense", "Athletico Paranaense", "1968", "1970", appearances=32)
            ],
            provider_ids={"transfermarkt": "151240", "wikidata": "Q206718"},
            career_complete=True
        ),
        # 229. Javier Saviola
        player(
            "javier_saviola", "Javier Saviola", "Javier Pedro Saviola Fernández",
            ["Saviola", "El Conejo", "Javier Pedro Saviola Fernandez"],
            "1981-12-11", ["Argentina", "Spain"], "retired",
            [
                stint(1, "river_plate", "River Plate", "1998", "2001", appearances=86),
                stint(2, "fcb", "Barcelona", "2001", "2004", appearances=105),
                stint(3, "monaco", "Monaco", "2004", "2005", appearances=29, stint_type="loan"),
                stint(4, "sevilla", "Sevilla", "2005", "2006", appearances=29, stint_type="loan"),
                stint(5, "fcb", "Barcelona", "2006", "2007", appearances=18),
                stint(6, "rmcf", "Real Madrid", "2007", "2009", appearances=17),
                stint(7, "benfica", "Benfica", "2009", "2012", appearances=69),
                stint(8, "malaga", "Málaga", "2012", "2013", appearances=27),
                stint(9, "olympiacos", "Olympiacos", "2013", "2014", appearances=25),
                stint(10, "verona", "Hellas Verona", "2014", "2015", appearances=15),
                stint(11, "river_plate", "River Plate", "2015", "2015", appearances=13)
            ],
            provider_ids={"transfermarkt": "7599", "wikidata": "Q190626"},
            career_complete=True
        ),
        # 230. Pablo Aimar
        player(
            "pablo_aimar", "Pablo Aimar", "Pablo César Aimar Giordano",
            ["Aimar", "El Payaso", "Pablo Cesar Aimar Giordano"],
            "1979-11-03", ["Argentina", "Spain"], "retired",
            [
                stint(1, "river_plate", "River Plate", "1996", "2000", appearances=82),
                stint(2, "valencia", "Valencia", "2001", "2006", appearances=162),
                stint(3, "zaragoza", "Real Zaragoza", "2006", "2008", appearances=53),
                stint(4, "benfica", "Benfica", "2008", "2013", appearances=107),
                stint(5, "johor_darul_tazim", "Johor Darul Ta'zim", "2014", "2014", appearances=8),
                stint(6, "river_plate", "River Plate", "2015", "2015", appearances=1)
            ],
            provider_ids={"transfermarkt": "3411", "wikidata": "Q174776"},
            career_complete=True
        ),
        # 231. Walter Samuel
        player(
            "walter_samuel", "Walter Samuel", "Walter Adrián Luján Samuel",
            ["Samuel", "Il Muro", "Walter Adrian Lujan Samuel"],
            "1978-03-23", ["Argentina"], "retired",
            [
                stint(1, "newells_old_boys", "Newell's Old Boys", "1996", "1997", appearances=37),
                stint(2, "boca_juniors", "Boca Juniors", "1997", "2000", appearances=77),
                stint(3, "roma", "Roma", "2000", "2004", appearances=122),
                stint(4, "rmcf", "Real Madrid", "2004", "2005", appearances=30),
                stint(5, "inter", "Inter Milan", "2005", "2014", appearances=169),
                stint(6, "basel", "Basel", "2014", "2016", appearances=31)
            ],
            provider_ids={"transfermarkt": "3410", "wikidata": "Q188554"},
            career_complete=True
        ),
        # 232. Claudio Caniggia
        player(
            "claudio_caniggia", "Claudio Caniggia", "Claudio Paul Caniggia",
            ["Caniggia", "El Hijo del Viento", "Claudio Paul Caniggia"],
            "1967-01-09", ["Argentina"], "retired",
            [
                stint(1, "river_plate", "River Plate", "1985", "1988", appearances=53),
                stint(2, "verona", "Hellas Verona", "1988", "1989", appearances=21),
                stint(3, "atalanta", "Atalanta", "1989", "1992", appearances=85),
                stint(4, "roma", "Roma", "1992", "1994", appearances=15),
                stint(5, "benfica", "Benfica", "1994", "1995", appearances=23, stint_type="loan"),
                stint(6, "boca_juniors", "Boca Juniors", "1995", "1998", appearances=46),
                stint(7, "atalanta", "Atalanta", "1999", "2000", appearances=17),
                stint(8, "dundee", "Dundee", "2000", "2001", appearances=21),
                stint(9, "rangers", "Rangers", "2001", "2003", appearances=50),
                stint(10, "qatar_sc", "Qatar SC", "2003", "2004", appearances=15)
            ],
            provider_ids={"transfermarkt": "10367", "wikidata": "Q216877"},
            career_complete=True
        ),
        # 233. Jorge Valdano
        player(
            "jorge_valdano", "Jorge Valdano", "Jorge Alberto Francisco Valdano Castellanos",
            ["Valdano", "Jorge Alberto Valdano"],
            "1955-10-04", ["Argentina"], "retired",
            [
                stint(1, "newells_old_boys", "Newell's Old Boys", "1973", "1975", appearances=46),
                stint(2, "alaves", "Alavés", "1975", "1979", appearances=107),
                stint(3, "zaragoza", "Real Zaragoza", "1979", "1984", appearances=143),
                stint(4, "rmcf", "Real Madrid", "1984", "1987", appearances=85)
            ],
            provider_ids={"transfermarkt": "116747", "wikidata": "Q298305"},
            career_complete=True
        ),
        # 234. Mario Kempes
        player(
            "mario_kempes", "Mario Kempes", "Mario Alberto Kempes Chiodi",
            ["Kempes", "El Matador", "Mario Alberto Kempes"],
            "1954-07-15", ["Argentina"], "retired",
            [
                stint(1, "instituto", "Instituto", "1970", "1973", appearances=13),
                stint(2, "rosario_central", "Rosario Central", "1974", "1976", appearances=107),
                stint(3, "valencia", "Valencia", "1976", "1981", appearances=142),
                stint(4, "river_plate", "River Plate", "1981", "1982", appearances=29),
                stint(5, "valencia", "Valencia", "1982", "1984", appearances=42),
                stint(6, "hercules", "Hércules", "1984", "1986", appearances=38),
                stint(7, "first_vienna", "First Vienna", "1986", "1987", appearances=20),
                stint(8, "st_polten", "VSE St. Pölten", "1987", "1990", appearances=96),
                stint(9, "kremser", "Kremser SC", "1990", "1992", appearances=39)
            ],
            provider_ids={"transfermarkt": "98701", "wikidata": "Q181827"},
            career_complete=True
        ),
        # 235. Daniel Passarella
        player(
            "daniel_passarella", "Daniel Passarella", "Daniel Alberto Passarella",
            ["Passarella", "El Gran Capitan", "Daniel Alberto Passarella"],
            "1953-05-25", ["Argentina"], "retired",
            [
                stint(1, "sarmiento", "Sarmiento", "1971", "1973", appearances=36),
                stint(2, "river_plate", "River Plate", "1974", "1982", appearances=226),
                stint(3, "fiorentina", "Fiorentina", "1982", "1986", appearances=109),
                stint(4, "inter", "Inter Milan", "1986", "1988", appearances=44)
            ],
            provider_ids={"transfermarkt": "116735", "wikidata": "Q221374"},
            career_complete=True
        ),
        # 236. Ubaldo Fillol
        player(
            "ubaldo_fillol", "Ubaldo Fillol", "Ubaldo Matildo Fillol",
            ["Fillol", "El Pato", "Ubaldo Matildo Fillol"],
            "1950-07-21", ["Argentina"], "retired",
            [
                stint(1, "quilmes", "Quilmes", "1969", "1971", appearances=57),
                stint(2, "racing_club", "Racing Club", "1972", "1973", appearances=59),
                stint(3, "river_plate", "River Plate", "1973", "1983", appearances=361),
                stint(4, "argentinos_juniors", "Argentinos Juniors", "1983", "1983", appearances=17),
                stint(5, "flamengo", "Flamengo", "1984", "1985", appearances=34),
                stint(6, "atletico", "Atlético Madrid", "1985", "1986", appearances=17),
                stint(7, "racing_club", "Racing Club", "1987", "1989", appearances=64),
                stint(8, "velez_sarsfield", "Vélez Sarsfield", "1989", "1990", appearances=42)
            ],
            provider_ids={"transfermarkt": "135810", "wikidata": "Q362744"},
            career_complete=True
        ),
        # 237. Amadeo Carrizo
        player(
            "amadeo_carrizo", "Amadeo Carrizo", "Amadeo Raúl Carrizo",
            ["Amadeo Raul Carrizo", "El Gran Amadeo"],
            "1926-06-12", ["Argentina"], "retired",
            [
                stint(1, "river_plate", "River Plate", "1945", "1968", appearances=520),
                stint(2, "alianza_lima", "Alianza Lima", "1969", "1970", appearances=53)
            ],
            provider_ids={"transfermarkt": "251025", "wikidata": "Q451749"},
            career_complete=True
        ),
        # 238. José Luis Chilavert
        player(
            "jose_luis_chilavert", "José Luis Chilavert", "José Luis Félix Chilavert González",
            ["Chilavert", "El Buldog", "Jose Luis Chilavert"],
            "1965-07-27", ["Paraguay"], "retired",
            [
                stint(1, "sportivo_luqueno", "Sportivo Luqueño", "1982", "1984", appearances=67),
                stint(2, "guarani", "Guaraní", "1984", "1984", appearances=19),
                stint(3, "san_lorenzo", "San Lorenzo", "1985", "1988", appearances=122),
                stint(4, "zaragoza", "Real Zaragoza", "1988", "1991", appearances=79),
                stint(5, "velez_sarsfield", "Vélez Sarsfield", "1991", "2000", appearances=270),
                stint(6, "strasbourg", "Strasbourg", "2000", "2002", appearances=50),
                stint(7, "penarol", "Peñarol", "2003", "2003", appearances=15),
                stint(8, "velez_sarsfield", "Vélez Sarsfield", "2004", "2004", appearances=6)
            ],
            provider_ids={"transfermarkt": "5604", "wikidata": "Q186403"},
            career_complete=True
        ),
        # 239. Roque Santa Cruz
        player(
            "roque_santa_cruz", "Roque Santa Cruz", "Roque Luis Santa Cruz Cantero",
            ["Santa Cruz", "Roque Luis Santa Cruz Cantero"],
            "1981-08-16", ["Paraguay"], "active",
            [
                stint(1, "olimpia_asuncion", "Club Olimpia", "1997", "1999", appearances=23),
                stint(2, "bayern", "Bayern Munich", "1999", "2007", appearances=155),
                stint(3, "blackburn", "Blackburn Rovers", "2007", "2009", appearances=57),
                stint(4, "mancity", "Manchester City", "2009", "2011", appearances=20),
                stint(5, "blackburn", "Blackburn Rovers", "2011", "2011", appearances=9, stint_type="loan"),
                stint(6, "betis", "Real Betis", "2011", "2012", appearances=33, stint_type="loan"),
                stint(7, "malaga", "Málaga", "2012", "2014", appearances=62),
                stint(8, "cruz_azul", "Cruz Azul", "2015", "2015", appearances=10),
                stint(9, "malaga", "Málaga", "2015", "2016", appearances=17, stint_type="loan"),
                stint(10, "olimpia_asuncion", "Club Olimpia", "2016", "2021", appearances=178),
                stint(11, "libertad", "Club Libertad", "2022", None, appearances=88)
            ],
            provider_ids={"transfermarkt": "213", "wikidata": "Q152912"},
            career_complete=False
        ),
        # 240. Carlos Gamarra
        player(
            "carlos_gamarra", "Carlos Gamarra", "Carlos Alberto Gamarra Pavón",
            ["Gamarra", "El Colorado", "Carlos Alberto Gamarra Pavon"],
            "1971-02-17", ["Paraguay"], "retired",
            [
                stint(1, "cerro_porteno", "Cerro Porteño", "1991", "1992", appearances=20),
                stint(2, "independiente", "Independiente", "1992", "1993", appearances=8),
                stint(3, "cerro_porteno", "Cerro Porteño", "1993", "1995", appearances=57),
                stint(4, "internacional", "Internacional", "1995", "1997", appearances=54),
                stint(5, "benfica", "Benfica", "1997", "1998", appearances=13),
                stint(6, "corinthians", "Corinthians", "1998", "1999", appearances=31),
                stint(7, "atletico", "Atlético Madrid", "1999", "2000", appearances=32),
                stint(8, "flamengo", "Flamengo", "2000", "2001", appearances=30),
                stint(9, "aek_athens", "AEK Athens", "2001", "2002", appearances=24),
                stint(10, "inter", "Inter Milan", "2002", "2005", appearances=27),
                stint(11, "palmeiras", "Palmeiras", "2005", "2006", appearances=33),
                stint(12, "olimpia_asuncion", "Club Olimpia", "2007", "2007", appearances=25)
            ],
            provider_ids={"transfermarkt": "5865", "wikidata": "Q312480"},
            career_complete=True
        ),
        # 241. Claudio Pizarro
        player(
            "claudio_pizarro", "Claudio Pizarro", "Claudio Miguel Pizarro Bosio",
            ["Pizarro", "El Bombardero de los Andes", "Claudio Miguel Pizarro Bosio"],
            "1978-10-03", ["Peru", "Italy"], "retired",
            [
                stint(1, "deportivo_pesquero", "Deportivo Pesquero", "1996", "1997", appearances=41),
                stint(2, "alianza_lima", "Alianza Lima", "1998", "1999", appearances=44),
                stint(3, "werder_bremen", "Werder Bremen", "1999", "2001", appearances=56),
                stint(4, "bayern", "Bayern Munich", "2001", "2007", appearances=174),
                stint(5, "cfc", "Chelsea", "2007", "2008", appearances=21),
                stint(6, "werder_bremen", "Werder Bremen", "2008", "2012", appearances=103),
                stint(7, "bayern", "Bayern Munich", "2012", "2015", appearances=50),
                stint(8, "werder_bremen", "Werder Bremen", "2015", "2017", appearances=47),
                stint(9, "koln", "1. FC Köln", "2017", "2018", appearances=16),
                stint(10, "werder_bremen", "Werder Bremen", "2018", "2020", appearances=44)
            ],
            provider_ids={"transfermarkt": "263", "wikidata": "Q107008"},
            career_complete=True
        ),
        # 242. Paolo Guerrero
        player(
            "paolo_guerrero", "Paolo Guerrero", "José Paolo Guerrero Gonzales",
            ["Guerrero", "El Depredador", "Jose Paolo Guerrero Gonzales"],
            "1984-01-01", ["Peru"], "active",
            [
                stint(1, "bayern", "Bayern Munich", "2004", "2006", appearances=27),
                stint(2, "hamburger_sv", "Hamburger SV", "2006", "2012", appearances=134),
                stint(3, "corinthians", "Corinthians", "2012", "2015", appearances=64),
                stint(4, "flamengo", "Flamengo", "2015", "2018", appearances=60),
                stint(5, "internacional", "Internacional", "2019", "2021", appearances=47),
                stint(6, "avai", "Avaí", "2022", "2022", appearances=10),
                stint(7, "racing_club", "Racing Club", "2023", "2023", appearances=15),
                stint(8, "ldu_quito", "LDU Quito", "2023", "2023", appearances=13),
                stint(9, "cesar_vallejo", "Universidad César Vallejo", "2024", "2024", appearances=6),
                stint(10, "alianza_lima", "Alianza Lima", "2024", None, appearances=4)
            ],
            provider_ids={"transfermarkt": "2989", "wikidata": "Q156765"},
            career_complete=False,
            exclusions=[{"club": "Bayern Munich II", "reason": "b-team-only", "evidence": "Played 66 games in Regionalliga Süd 2002-2004 before senior first team debut."}]
        ),
        # 243. Jefferson Farfán
        player(
            "jefferson_farfan", "Jefferson Farfán", "Jefferson Agustín Farfán Guadalupe",
            ["Farfan", "La Foquita", "Jefferson Agustin Farfan Guadalupe"],
            "1984-10-26", ["Peru"], "retired",
            [
                stint(1, "alianza_lima", "Alianza Lima", "2001", "2004", appearances=77),
                stint(2, "psv", "PSV Eindhoven", "2004", "2008", appearances=118),
                stint(3, "schalke", "Schalke 04", "2008", "2015", appearances=170),
                stint(4, "al_jazira", "Al Jazira", "2015", "2016", appearances=12),
                stint(5, "lokomotiv_moscow", "Lokomotiv Moscow", "2017", "2020", appearances=54),
                stint(6, "alianza_lima", "Alianza Lima", "2021", "2022", appearances=17)
            ],
            provider_ids={"transfermarkt": "14460", "wikidata": "Q186414"},
            career_complete=True
        ),
        # 244. Teófilo Cubillas
        player(
            "teofilo_cubillas", "Teófilo Cubillas", "Teófilo Juan Cubillas Arizaga",
            ["Cubillas", "El Nene", "Teofilo Juan Cubillas Arizaga"],
            "1949-03-08", ["Peru"], "retired",
            [
                stint(1, "alianza_lima", "Alianza Lima", "1966", "1972", appearances=175),
                stint(2, "basel", "Basel", "1973", "1973", appearances=10),
                stint(3, "porto", "Porto", "1974", "1977", appearances=85),
                stint(4, "alianza_lima", "Alianza Lima", "1977", "1978", appearances=47),
                stint(5, "fl_strikers", "Fort Lauderdale Strikers", "1979", "1983", appearances=120),
                stint(6, "alianza_lima", "Alianza Lima", "1984", "1984", appearances=4),
                stint(7, "south_fl_sun", "South Florida Sun", "1985", "1985", appearances=6),
                stint(8, "alianza_lima", "Alianza Lima", "1987", "1988", appearances=13),
                stint(9, "miami_sharks", "Miami Sharks", "1988", "1988", appearances=16)
            ],
            provider_ids={"transfermarkt": "101491", "wikidata": "Q210112"},
            career_complete=True
        ),
        # 245. Nolberto Solano
        player(
            "nolberto_solano", "Nolberto Solano", "Nolberto Albino Solano Todco",
            ["Solano", "Nobby", "Nolberto Albino Solano Todco"],
            "1974-12-12", ["Peru"], "retired",
            [
                stint(1, "sporting_cristal", "Sporting Cristal", "1992", "1993", appearances=18),
                stint(2, "deportivo_municipal", "Deportivo Municipal", "1993", "1993", appearances=18, stint_type="loan"),
                stint(3, "sporting_cristal", "Sporting Cristal", "1994", "1997", appearances=80),
                stint(4, "boca_juniors", "Boca Juniors", "1997", "1998", appearances=32),
                stint(5, "newcastle", "Newcastle United", "1998", "2004", appearances=172),
                stint(6, "aston_villa", "Aston Villa", "2004", "2005", appearances=49),
                stint(7, "newcastle", "Newcastle United", "2005", "2007", appearances=58),
                stint(8, "west_ham", "West Ham United", "2007", "2008", appearances=23),
                stint(9, "larissa", "Larissa", "2008", "2009", appearances=17),
                stint(10, "universitario", "Universitario", "2009", "2009", appearances=26),
                stint(11, "leicester", "Leicester City", "2010", "2010", appearances=11),
                stint(12, "hull_city", "Hull City", "2010", "2011", appearances=11),
                stint(13, "hartlepool", "Hartlepool United", "2011", "2012", appearances=14)
            ],
            provider_ids={"transfermarkt": "3461", "wikidata": "Q316499"},
            career_complete=True
        ),
        # 246. Antonio Valencia
        player(
            "antonio_valencia", "Antonio Valencia", "Luis Antonio Valencia Mosquera",
            ["Valencia", "Luis Antonio Valencia Mosquera"],
            "1985-08-04", ["Ecuador"], "retired",
            [
                stint(1, "el_nacional", "El Nacional", "2003", "2005", appearances=83),
                stint(2, "villarreal", "Villarreal", "2005", "2005", appearances=2),
                stint(3, "recreativo", "Recreativo Huelva", "2005", "2006", appearances=12, stint_type="loan"),
                stint(4, "wigan", "Wigan Athletic", "2006", "2009", appearances=84),
                stint(5, "manu", "Manchester United", "2009", "2019", appearances=241),
                stint(6, "ldu_quito", "LDU Quito", "2019", "2020", appearances=14),
                stint(7, "queretaro", "Querétaro", "2021", "2021", appearances=14)
            ],
            provider_ids={"transfermarkt": "38843", "wikidata": "Q484022"},
            career_complete=True
        ),
        # 247. Enner Valencia
        player(
            "enner_valencia", "Enner Valencia", "Enner Remberto Valencia Lastra",
            ["Valencia", "Superman", "Enner Remberto Valencia Lastra"],
            "1989-11-04", ["Ecuador"], "active",
            [
                stint(1, "emelec", "Emelec", "2010", "2013", appearances=130),
                stint(2, "pachuca", "Pachuca", "2014", "2014", appearances=23),
                stint(3, "west_ham", "West Ham United", "2014", "2016", appearances=54),
                stint(4, "everton", "Everton", "2016", "2017", appearances=21, stint_type="loan"),
                stint(5, "tigres", "Tigres UANL", "2017", "2020", appearances=95),
                stint(6, "fenerbahce", "Fenerbahçe", "2020", "2023", appearances=90),
                stint(7, "internacional", "Internacional", "2023", None, appearances=36)
            ],
            provider_ids={"transfermarkt": "139503", "wikidata": "Q737877"},
            career_complete=False
        ),
        # 248. Faustino Asprilla
        player(
            "faustino_asprilla", "Faustino Asprilla", "Faustino Hernán Asprilla Hinestroza",
            ["Asprilla", "El Tino", "Faustino Hernan Asprilla Hinestroza"],
            "1969-11-10", ["Colombia"], "retired",
            [
                stint(1, "cucuta_deportivo", "Cúcuta Deportivo", "1988", "1989", appearances=36),
                stint(2, "atletico_nacional", "Atlético Nacional", "1989", "1992", appearances=75),
                stint(3, "parma", "Parma", "1992", "1995", appearances=84),
                stint(4, "newcastle", "Newcastle United", "1996", "1998", appearances=48),
                stint(5, "parma", "Parma", "1998", "1999", appearances=12),
                stint(6, "palmeiras", "Palmeiras", "1999", "2000", appearances=18),
                stint(7, "fluminense", "Fluminense", "2000", "2001", appearances=12),
                stint(8, "atlante", "Atlante", "2001", "2002", appearances=12),
                stint(9, "atletico_nacional", "Atlético Nacional", "2002", "2002", appearances=11),
                stint(10, "u_de_chile", "Universidad de Chile", "2003", "2003", appearances=13),
                stint(11, "estudiantes", "Estudiantes", "2003", "2004", appearances=2),
                stint(12, "cortulua", "Cortuluá", "2004", "2004", appearances=1)
            ],
            provider_ids={"transfermarkt": "100494", "wikidata": "Q311893"},
            career_complete=True
        ),
        # 249. Iván Córdoba
        player(
            "ivan_cordoba", "Iván Córdoba", "Iván Ramiro Córdoba Sepúlveda",
            ["Cordoba", "Ivan Ramiro Cordoba Sepulveda"],
            "1976-08-11", ["Colombia"], "retired",
            [
                stint(1, "rionegro", "Deportivo Rionegro", "1993", "1995", appearances=42),
                stint(2, "atletico_nacional", "Atlético Nacional", "1996", "1998", appearances=73),
                stint(3, "san_lorenzo", "San Lorenzo", "1998", "2000", appearances=59),
                stint(4, "inter", "Inter Milan", "2000", "2012", appearances=324)
            ],
            provider_ids={"transfermarkt": "5764", "wikidata": "Q216946"},
            career_complete=True
        ),
        # 250. Mario Yepes
        player(
            "mario_yepes", "Mario Yepes", "Mario Alberto Yepes Díaz",
            ["Yepes", "Super Mario", "Mario Alberto Yepes Diaz"],
            "1976-01-13", ["Colombia"], "retired",
            [
                stint(1, "cortulua", "Cortuluá", "1994", "1997", appearances=59),
                stint(2, "deportivo_cali", "Deportivo Cali", "1997", "1999", appearances=87),
                stint(3, "river_plate", "River Plate", "1999", "2002", appearances=76),
                stint(4, "nantes", "Nantes", "2002", "2004", appearances=73),
                stint(5, "psg", "Paris Saint-Germain", "2004", "2008", appearances=115),
                stint(6, "chievo", "Chievo", "2008", "2010", appearances=63),
                stint(7, "acmilan", "AC Milan", "2010", "2013", appearances=38),
                stint(8, "atalanta", "Atalanta", "2013", "2014", appearances=24),
                stint(9, "san_lorenzo", "San Lorenzo", "2014", "2015", appearances=31)
            ],
            provider_ids={"transfermarkt": "5684", "wikidata": "Q242484"},
            career_complete=True
        ),
        # 251. Juan Cuadrado
        player(
            "juan_cuadrado", "Juan Cuadrado", "Juan Guillermo Cuadrado Bello",
            ["Cuadrado", "Juan Guillermo Cuadrado Bello"],
            "1988-05-26", ["Colombia"], "active",
            [
                stint(1, "independiente_medellin", "Independiente Medellín", "2008", "2009", appearances=30),
                stint(2, "udinese", "Udinese", "2009", "2011", appearances=20),
                stint(3, "lecce", "Lecce", "2011", "2012", appearances=33, stint_type="loan"),
                stint(4, "fiorentina", "Fiorentina", "2012", "2015", appearances=85),
                stint(5, "cfc", "Chelsea", "2015", "2015", appearances=13),
                stint(6, "juve", "Juventus", "2015", "2023", appearances=224),
                stint(7, "inter", "Inter Milan", "2023", "2024", appearances=10),
                stint(8, "atalanta", "Atalanta", "2024", None, appearances=3)
            ],
            provider_ids={"transfermarkt": "91970", "wikidata": "Q368361"},
            career_complete=False
        ),
        # 252. Luis Díaz
        player(
            "luis_diaz", "Luis Díaz", "Luis Fernando Díaz Marulanda",
            ["Diaz", "Lucho Diaz", "Luis Fernando Diaz Marulanda"],
            "1997-01-13", ["Colombia"], "active",
            [
                stint(1, "barranquilla", "Barranquilla", "2016", "2017", appearances=34),
                stint(2, "junior", "Junior", "2017", "2019", appearances=86),
                stint(3, "porto", "Porto", "2019", "2022", appearances=77),
                stint(4, "lfc", "Liverpool", "2022", None, appearances=74)
            ],
            provider_ids={"transfermarkt": "480692", "wikidata": "Q29959582"},
            career_complete=False
        ),
        # 253. Freddy Rincón
        player(
            "freddy_rincon", "Freddy Rincón", "Freddy Eusebio Rincón Valencia",
            ["Rincon", "El Coloso", "Freddy Eusebio Rincon Valencia"],
            "1966-08-14", ["Colombia"], "retired",
            [
                stint(1, "santa_fe", "Santa Fe", "1986", "1989", appearances=127),
                stint(2, "america_de_cali", "América de Cali", "1990", "1993", appearances=176),
                stint(3, "palmeiras", "Palmeiras", "1994", "1994", appearances=28),
                stint(4, "napoli", "Napoli", "1994", "1995", appearances=28),
                stint(5, "rmcf", "Real Madrid", "1995", "1996", appearances=14),
                stint(6, "palmeiras", "Palmeiras", "1996", "1997", appearances=17),
                stint(7, "corinthians", "Corinthians", "1997", "2000", appearances=151),
                stint(8, "santos", "Santos", "2000", "2001", appearances=20),
                stint(9, "cruzeiro", "Cruzeiro", "2001", "2001", appearances=16),
                stint(10, "corinthians", "Corinthians", "2004", "2004", appearances=7)
            ],
            provider_ids={"transfermarkt": "103670", "wikidata": "Q433433"},
            career_complete=True
        ),
        # 254. René Higuita
        player(
            "rene_higuita", "René Higuita", "José René Higuita Zapata",
            ["Higuita", "El Loco", "Jose Rene Higuita Zapata"],
            "1966-08-27", ["Colombia"], "retired",
            [
                stint(1, "millonarios", "Millonarios", "1985", "1985", appearances=16),
                stint(2, "atletico_nacional", "Atlético Nacional", "1986", "1992", appearances=112),
                stint(3, "real_valladolid", "Real Valladolid", "1992", "1992", appearances=15),
                stint(4, "atletico_nacional", "Atlético Nacional", "1993", "1997", appearances=69),
                stint(5, "veracruz", "Veracruz", "1997", "1998", appearances=30),
                stint(6, "independiente_medellin", "Independiente Medellín", "1999", "1999", appearances=20),
                stint(7, "real_cartagena", "Real Cartagena", "2000", "2000", appearances=21),
                stint(8, "junior", "Junior", "2001", "2001", appearances=4),
                stint(9, "deportivo_pereira", "Deportivo Pereira", "2002", "2003", appearances=13),
                stint(10, "aucas", "Aucas", "2004", "2004", appearances=35),
                stint(11, "guaros", "Guaros", "2007", "2007", appearances=10),
                stint(12, "deportivo_pereira", "Deportivo Pereira", "2008", "2009", appearances=14)
            ],
            provider_ids={"transfermarkt": "100492", "wikidata": "Q179612"},
            career_complete=True
        ),
        # 255. Álvaro Recoba
        player(
            "alvaro_recoba", "Álvaro Recoba", "Álvaro Gerardo Recoba Rivero",
            ["Recoba", "El Chino", "Alvaro Gerardo Recoba Rivero"],
            "1976-03-17", ["Uruguay"], "retired",
            [
                stint(1, "danubio", "Danubio", "1993", "1995", appearances=31),
                stint(2, "nacional", "Nacional", "1996", "1997", appearances=27),
                stint(3, "inter", "Inter Milan", "1997", "1999", appearances=13),
                stint(4, "venezia", "Venezia", "1999", "1999", appearances=19, stint_type="loan"),
                stint(5, "inter", "Inter Milan", "1999", "2007", appearances=162),
                stint(6, "torino", "Torino", "2007", "2008", appearances=22, stint_type="loan"),
                stint(7, "panionios", "Panionios", "2008", "2009", appearances=19),
                stint(8, "danubio", "Danubio", "2010", "2011", appearances=31),
                stint(9, "nacional", "Nacional", "2011", "2015", appearances=82)
            ],
            provider_ids={"transfermarkt": "5794", "wikidata": "Q211116"},
            career_complete=True
        ),
        # 256. Enzo Francescoli
        player(
            "enzo_francescoli", "Enzo Francescoli", "Enzo Francescoli Uriarte",
            ["Francescoli", "El Principe", "Enzo Francescoli Uriarte"],
            "1961-11-12", ["Uruguay"], "retired",
            [
                stint(1, "wanderers", "Montevideo Wanderers", "1980", "1982", appearances=74),
                stint(2, "river_plate", "River Plate", "1983", "1986", appearances=113),
                stint(3, "racing_paris", "Racing Paris", "1986", "1989", appearances=89),
                stint(4, "marseille", "Marseille", "1989", "1990", appearances=28),
                stint(5, "cagliari", "Cagliari", "1990", "1993", appearances=98),
                stint(6, "torino", "Torino", "1993", "1994", appearances=24),
                stint(7, "river_plate", "River Plate", "1994", "1997", appearances=84)
            ],
            provider_ids={"transfermarkt": "116071", "wikidata": "Q210087"},
            career_complete=True
        ),
        # 257. Paolo Montero
        player(
            "paolo_montero", "Paolo Montero", "Rónald Paolo Montero Iglesias",
            ["Montero", "Ronald Paolo Montero Iglesias"],
            "1971-09-03", ["Uruguay"], "retired",
            [
                stint(1, "penarol", "Peñarol", "1990", "1992", appearances=34),
                stint(2, "atalanta", "Atalanta", "1992", "1996", appearances=114),
                stint(3, "juve", "Juventus", "1996", "2005", appearances=186),
                stint(4, "san_lorenzo", "San Lorenzo", "2005", "2006", appearances=14),
                stint(5, "penarol", "Peñarol", "2006", "2007", appearances=21)
            ],
            provider_ids={"transfermarkt": "5751", "wikidata": "Q313170"},
            career_complete=True
        ),
        # 258. Fernando Muslera
        player(
            "fernando_muslera", "Fernando Muslera", "Néstor Fernando Muslera Micol",
            ["Muslera", "Nestor Fernando Muslera Micol"],
            "1986-06-16", ["Uruguay"], "active",
            [
                stint(1, "wanderers", "Montevideo Wanderers", "2004", "2007", appearances=44),
                stint(2, "nacional", "Nacional", "2007", "2007", appearances=15, stint_type="loan"),
                stint(3, "lazio", "Lazio", "2007", "2011", appearances=96),
                stint(4, "galatasaray", "Galatasaray", "2011", None, appearances=412)
            ],
            provider_ids={"transfermarkt": "58088", "wikidata": "Q203732"},
            career_complete=False
        ),
        # 259. Diego Lugano
        player(
            "diego_lugano", "Diego Lugano", "Diego Alfredo Lugano Morena",
            ["Lugano", "Tota", "Diego Alfredo Lugano Morena"],
            "1980-11-02", ["Uruguay"], "retired",
            [
                stint(1, "plaza_colonia", "Plaza Colonia", "2001", "2002", appearances=46),
                stint(2, "sao_paulo", "São Paulo", "2003", "2006", appearances=96),
                stint(3, "fenerbahce", "Fenerbahçe", "2006", "2011", appearances=125),
                stint(4, "psg", "Paris Saint-Germain", "2011", "2013", appearances=12),
                stint(5, "malaga", "Málaga", "2013", "2013", appearances=11, stint_type="loan"),
                stint(6, "west_brom", "West Bromwich Albion", "2013", "2014", appearances=9),
                stint(7, "hacken", "BK Häcken", "2015", "2015", appearances=11),
                stint(8, "cerro_porteno", "Cerro Porteño", "2015", "2015", appearances=15),
                stint(9, "sao_paulo", "São Paulo", "2016", "2017", appearances=29)
            ],
            provider_ids={"transfermarkt": "13824", "wikidata": "Q215472"},
            career_complete=True
        ),
        # 260. Gary Medel
        player(
            "gary_medel", "Gary Medel", "Gary Alexis Medel Soto",
            ["Medel", "Pitbull", "Gary Alexis Medel Soto"],
            "1987-08-03", ["Chile"], "active",
            [
                stint(1, "u_catolica", "Universidad Católica", "2006", "2009", appearances=70),
                stint(2, "boca_juniors", "Boca Juniors", "2009", "2011", appearances=46),
                stint(3, "sevilla", "Sevilla", "2011", "2013", appearances=78),
                stint(4, "cardiff", "Cardiff City", "2013", "2014", appearances=34),
                stint(5, "inter", "Inter Milan", "2014", "2017", appearances=91),
                stint(6, "besiktas", "Beşiktaş", "2017", "2019", appearances=51),
                stint(7, "bologna", "Bologna", "2019", "2023", appearances=94),
                stint(8, "vasco_da_gama", "Vasco da Gama", "2023", "2024", appearances=22),
                stint(9, "boca_juniors", "Boca Juniors", "2024", None, appearances=9)
            ],
            provider_ids={"transfermarkt": "63393", "wikidata": "Q215453"},
            career_complete=False
        ),
        # 261. Elías Figueroa
        player(
            "elias_figueroa", "Elías Figueroa", "Elías Ricardo Figueroa Brander",
            ["Figueroa", "Don Elias", "Elias Ricardo Figueroa Brander"],
            "1946-10-25", ["Chile"], "retired",
            [
                stint(1, "union_la_calera", "Unión La Calera", "1964", "1964", appearances=30),
                stint(2, "santiago_wanderers", "Santiago Wanderers", "1965", "1966", appearances=54),
                stint(3, "penarol", "Peñarol", "1967", "1971", appearances=241),
                stint(4, "internacional", "Internacional", "1971", "1976", appearances=336),
                stint(5, "palestino", "Palestino", "1977", "1980", appearances=103),
                stint(6, "fl_strikers", "Fort Lauderdale Strikers", "1981", "1981", appearances=22),
                stint(7, "colo_colo", "Colo-Colo", "1982", "1982", appearances=17)
            ],
            provider_ids={"transfermarkt": "145377", "wikidata": "Q312484"},
            career_complete=True
        ),
        # 262. Carlos Caszely
        player(
            "carlos_caszely", "Carlos Caszely", "Carlos Humberto Caszely Garrido",
            ["Caszely", "El Rey del Metro Cuadrado", "Carlos Humberto Caszely Garrido"],
            "1950-07-05", ["Chile"], "retired",
            [
                stint(1, "colo_colo", "Colo-Colo", "1967", "1973", appearances=127),
                stint(2, "levante", "Levante", "1973", "1974", appearances=24),
                stint(3, "espanyol", "Espanyol", "1974", "1977", appearances=46),
                stint(4, "colo_colo", "Colo-Colo", "1978", "1985", appearances=186),
                stint(5, "barcelona_sc", "Barcelona SC", "1986", "1986", appearances=19)
            ],
            provider_ids={"transfermarkt": "145374", "wikidata": "Q453483"},
            career_complete=True
        ),
        # 263. Cuauhtémoc Blanco
        player(
            "cuauhtemoc_blanco", "Cuauhtémoc Blanco", "Cuauhtémoc Blanco Bravo",
            ["Blanco", "Cuau", "Cuauhtemoc Blanco Bravo"],
            "1973-01-17", ["Mexico"], "retired",
            [
                stint(1, "club_america", "Club América", "1992", "1997", appearances=93),
                stint(2, "necaxa", "Necaxa", "1997", "1998", appearances=28, stint_type="loan"),
                stint(3, "club_america", "Club América", "1998", "2000", appearances=64),
                stint(4, "real_valladolid", "Real Valladolid", "2000", "2002", appearances=23, stint_type="loan"),
                stint(5, "club_america", "Club América", "2002", "2004", appearances=71),
                stint(6, "veracruz", "Veracruz", "2004", "2004", appearances=15),
                stint(7, "club_america", "Club América", "2005", "2007", appearances=69),
                stint(8, "chicago_fire", "Chicago Fire", "2007", "2009", appearances=62),
                stint(9, "santos_laguna", "Santos Laguna", "2008", "2008", appearances=4, stint_type="loan"),
                stint(10, "veracruz", "Veracruz", "2010", "2010", appearances=14),
                stint(11, "irapuato", "Irapuato", "2010", "2011", appearances=37),
                stint(12, "la_piedad", "La Piedad", "2011", "2012", appearances=19),
                stint(13, "dorados", "Dorados de Sinaloa", "2012", "2013", appearances=34),
                stint(14, "lobos_buap", "Lobos BUAP", "2013", "2014", appearances=17),
                stint(15, "puebla", "Puebla", "2014", "2015", appearances=19),
                stint(16, "club_america", "Club América", "2016", "2016", appearances=1)
            ],
            provider_ids={"transfermarkt": "29434", "wikidata": "Q216960"},
            career_complete=True
        ),
        # 264. Javier Hernández ("Chicharito")
        player(
            "javier_hernandez", "Javier Hernández", "Javier Hernández Balcázar",
            ["Chicharito", "Javier Hernandez Balcazar"],
            "1988-06-01", ["Mexico"], "active",
            [
                stint(1, "guadalajara", "Guadalajara", "2006", "2010", appearances=64),
                stint(2, "manu", "Manchester United", "2010", "2014", appearances=102),
                stint(3, "rmcf", "Real Madrid", "2014", "2015", appearances=23, stint_type="loan"),
                stint(4, "leverkusen", "Bayer Leverkusen", "2015", "2017", appearances=54),
                stint(5, "west_ham", "West Ham United", "2017", "2019", appearances=55),
                stint(6, "sevilla", "Sevilla", "2019", "2020", appearances=9),
                stint(7, "la_galaxy", "LA Galaxy", "2020", "2023", appearances=74),
                stint(8, "guadalajara", "Guadalajara", "2024", None, appearances=10)
            ],
            provider_ids={"transfermarkt": "50726", "wikidata": "Q170669"},
            career_complete=False
        ),
        # 265. Guillermo Ochoa
        player(
            "guillermo_ochoa", "Guillermo Ochoa", "Francisco Guillermo Ochoa Magaña",
            ["Ochoa", "Memo Ochoa", "Francisco Guillermo Ochoa Magana"],
            "1985-07-13", ["Mexico"], "active",
            [
                stint(1, "club_america", "Club América", "2004", "2011", appearances=211),
                stint(2, "ajaccio", "Ajaccio", "2011", "2014", appearances=112),
                stint(3, "malaga", "Málaga", "2014", "2016", appearances=11),
                stint(4, "granada", "Granada", "2016", "2017", appearances=38, stint_type="loan"),
                stint(5, "standard_liege", "Standard Liège", "2017", "2019", appearances=78),
                stint(6, "club_america", "Club América", "2019", "2022", appearances=118),
                stint(7, "salernitana", "Salernitana", "2023", "2024", appearances=40),
                stint(8, "avs", "AVS", "2024", None, appearances=3)
            ],
            provider_ids={"transfermarkt": "29559", "wikidata": "Q208036"},
            career_complete=False
        ),
        # 266. Andrés Guardado
        player(
            "andres_guardado", "Andrés Guardado", "José Andrés Guardado Hernández",
            ["Guardado", "Principito", "Jose Andres Guardado Hernandez"],
            "1986-09-28", ["Mexico", "Spain"], "active",
            [
                stint(1, "atlas", "Atlas", "2005", "2007", appearances=62),
                stint(2, "deportivo", "Deportivo La Coruña", "2007", "2012", appearances=137),
                stint(3, "valencia", "Valencia", "2012", "2014", appearances=48),
                stint(4, "leverkusen", "Bayer Leverkusen", "2014", "2014", appearances=4, stint_type="loan"),
                stint(5, "psv", "PSV Eindhoven", "2014", "2017", appearances=80),
                stint(6, "betis", "Real Betis", "2017", "2024", appearances=178),
                stint(7, "leon", "Club León", "2024", None, appearances=17)
            ],
            provider_ids={"transfermarkt": "39484", "wikidata": "Q215463"},
            career_complete=False
        ),
        # 267. Carlos Vela
        player(
            "carlos_vela", "Carlos Vela", "Carlos Alberto Vela Garrido",
            ["Vela", "Carlos Alberto Vela Garrido"],
            "1989-03-01", ["Mexico", "Spain"], "active",
            [
                stint(1, "salamanca", "Salamanca", "2006", "2007", appearances=31, stint_type="loan"),
                stint(2, "osasuna", "Osasuna", "2007", "2008", appearances=33, stint_type="loan"),
                stint(3, "afc", "Arsenal", "2008", "2011", appearances=29),
                stint(4, "west_brom", "West Bromwich Albion", "2011", "2011", appearances=8, stint_type="loan"),
                stint(5, "real_sociedad", "Real Sociedad", "2011", "2018", appearances=219),
                stint(6, "lafc", "Los Angeles FC", "2018", None, appearances=152)
            ],
            provider_ids={"transfermarkt": "35773", "wikidata": "Q216962"},
            career_complete=False,
            exclusions=[{"club": "Celta Vigo", "reason": "administrative-loan-only", "evidence": "Loaned from Arsenal in Feb 2006 due to work permit restrictions; made 0 official senior appearances."}]
        ),
        # 268. Jorge Campos
        player(
            "jorge_campos", "Jorge Campos", "Jorge Campos Navarrete",
            ["Campos", "El Brody", "Jorge Campos Navarrete"],
            "1966-10-15", ["Mexico"], "retired",
            [
                stint(1, "pumas", "UNAM Pumas", "1988", "1995", appearances=205),
                stint(2, "atlante", "Atlante", "1995", "1996", appearances=30),
                stint(3, "la_galaxy", "LA Galaxy", "1996", "1997", appearances=43),
                stint(4, "cruz_azul", "Cruz Azul", "1997", "1997", appearances=2),
                stint(5, "chicago_fire", "Chicago Fire", "1998", "1998", appearances=8),
                stint(6, "pumas", "UNAM Pumas", "1998", "1999", appearances=27),
                stint(7, "tigres", "Tigres UANL", "1999", "2000", appearances=17),
                stint(8, "atlante", "Atlante", "2000", "2001", appearances=26),
                stint(9, "puebla", "Puebla", "2002", "2004", appearances=28)
            ],
            provider_ids={"transfermarkt": "102693", "wikidata": "Q313540"},
            career_complete=True
        ),
        # 269. Tim Howard
        player(
            "tim_howard", "Tim Howard", "Timothy Matthew Howard",
            ["Howard", "Timothy Matthew Howard"],
            "1979-03-06", ["United States"], "retired",
            [
                stint(1, "north_jersey_imperials", "North Jersey Imperials", "1997", "1997", appearances=6),
                stint(2, "metrostars", "MetroStars", "1998", "2003", appearances=88),
                stint(3, "manu", "Manchester United", "2003", "2006", appearances=45),
                stint(4, "everton", "Everton", "2006", "2016", appearances=354),
                stint(5, "colorado_rapids", "Colorado Rapids", "2016", "2019", appearances=100),
                stint(6, "memphis_901", "Memphis 901", "2020", "2020", appearances=6)
            ],
            provider_ids={"transfermarkt": "3889", "wikidata": "Q206381"},
            career_complete=True
        ),
        # 270. Brad Friedel
        player(
            "brad_friedel", "Brad Friedel", "Bradley Howard Friedel",
            ["Friedel", "Bradley Howard Friedel"],
            "1971-05-18", ["United States"], "retired",
            [
                stint(1, "galatasaray", "Galatasaray", "1995", "1996", appearances=30),
                stint(2, "columbus_crew", "Columbus Crew", "1996", "1997", appearances=38),
                stint(3, "lfc", "Liverpool", "1997", "2000", appearances=25),
                stint(4, "blackburn", "Blackburn Rovers", "2000", "2008", appearances=287),
                stint(5, "aston_villa", "Aston Villa", "2008", "2011", appearances=114),
                stint(6, "tottenham", "Tottenham Hotspur", "2011", "2015", appearances=50)
            ],
            provider_ids={"transfermarkt": "3479", "wikidata": "Q216937"},
            career_complete=True
        ),
        # 271. Christian Pulisic
        player(
            "christian_pulisic", "Christian Pulisic", "Christian Mate Pulisic",
            ["Pulisic", "Captain America", "Christian Mate Pulisic"],
            "1998-09-18", ["United States", "Croatia"], "active",
            [
                stint(1, "bvb", "Borussia Dortmund", "2016", "2019", appearances=90),
                stint(2, "cfc", "Chelsea", "2019", "2023", appearances=98),
                stint(3, "acmilan", "AC Milan", "2023", None, appearances=42)
            ],
            provider_ids={"transfermarkt": "315779", "wikidata": "Q19280045"},
            career_complete=False
        ),
        # 272. Michael Bradley
        player(
            "michael_bradley", "Michael Bradley", "Michael Sheehan Bradley",
            ["Bradley", "Michael Sheehan Bradley"],
            "1987-07-31", ["United States"], "retired",
            [
                stint(1, "metrostars", "MetroStars", "2004", "2005", appearances=30),
                stint(2, "heerenveen", "Heerenveen", "2006", "2008", appearances=57),
                stint(3, "bmg", "Borussia Mönchengladbach", "2008", "2011", appearances=76),
                stint(4, "aston_villa", "Aston Villa", "2011", "2011", appearances=3, stint_type="loan"),
                stint(5, "chievo", "Chievo", "2011", "2012", appearances=35),
                stint(6, "roma", "Roma", "2012", "2014", appearances=41),
                stint(7, "toronto_fc", "Toronto FC", "2014", "2023", appearances=258),
                stint(8, "stabaek", "Stabæk", "2023", "2023", appearances=4)
            ],
            provider_ids={"transfermarkt": "37716", "wikidata": "Q215458"},
            career_complete=True
        ),
        # 273. Brian McBride
        player(
            "brian_mcbride", "Brian McBride", "Brian Robert McBride",
            ["McBride", "Brian Robert McBride"],
            "1972-06-19", ["United States"], "retired",
            [
                stint(1, "milwaukee_rampage", "Milwaukee Rampage", "1994", "1994", appearances=18),
                stint(2, "vfl_wolfsburg", "VfL Wolfsburg", "1994", "1995", appearances=18),
                stint(3, "columbus_crew", "Columbus Crew", "1996", "2003", appearances=161),
                stint(4, "preston", "Preston North End", "2000", "2001", appearances=9, stint_type="loan"),
                stint(5, "everton", "Everton", "2003", "2003", appearances=8, stint_type="loan"),
                stint(6, "fulham", "Fulham", "2004", "2008", appearances=140),
                stint(7, "chicago_fire", "Chicago Fire", "2008", "2010", appearances=59)
            ],
            provider_ids={"transfermarkt": "3475", "wikidata": "Q247402"},
            career_complete=True
        ),
        # 274. Kasey Keller
        player(
            "kasey_keller", "Kasey Keller", "Kasey C. Keller",
            ["Keller", "Kasey C. Keller"],
            "1969-11-29", ["United States"], "retired",
            [
                stint(1, "millwall", "Millwall", "1992", "1996", appearances=178),
                stint(2, "leicester", "Leicester City", "1996", "1999", appearances=99),
                stint(3, "rayo_vallecano", "Rayo Vallecano", "1999", "2001", appearances=51),
                stint(4, "tottenham", "Tottenham Hotspur", "2001", "2005", appearances=85),
                stint(5, "southampton", "Southampton", "2004", "2004", appearances=4, stint_type="loan"),
                stint(6, "bmg", "Borussia Mönchengladbach", "2005", "2007", appearances=78),
                stint(7, "fulham", "Fulham", "2007", "2008", appearances=13),
                stint(8, "seattle_sounders", "Seattle Sounders FC", "2009", "2011", appearances=93)
            ],
            provider_ids={"transfermarkt": "3476", "wikidata": "Q253724"},
            career_complete=True
        ),
        # 275. Claudio Reyna
        player(
            "claudio_reyna", "Claudio Reyna", "Claudio Reyna",
            ["Reyna", "Captain America"],
            "1973-07-20", ["United States"], "retired",
            [
                stint(1, "leverkusen", "Bayer Leverkusen", "1994", "1997", appearances=26),
                stint(2, "vfl_wolfsburg", "VfL Wolfsburg", "1997", "1999", appearances=48),
                stint(3, "rangers", "Rangers", "1999", "2001", appearances=64),
                stint(4, "sunderland", "Sunderland", "2001", "2003", appearances=28),
                stint(5, "mancity", "Manchester City", "2003", "2007", appearances=87),
                stint(6, "ny_red_bulls", "New York Red Bulls", "2007", "2008", appearances=29)
            ],
            provider_ids={"transfermarkt": "3473", "wikidata": "Q312487"},
            career_complete=True
        ),
        # 276. Dwight Yorke
        player(
            "dwight_yorke", "Dwight Yorke", "Dwight Eversley Yorke",
            ["Yorke", "The Smiling Assassin", "Dwight Eversley Yorke"],
            "1971-11-03", ["Trinidad and Tobago"], "retired",
            [
                stint(1, "aston_villa", "Aston Villa", "1989", "1998", appearances=231),
                stint(2, "manu", "Manchester United", "1998", "2002", appearances=96),
                stint(3, "blackburn", "Blackburn Rovers", "2002", "2004", appearances=60),
                stint(4, "birmingham", "Birmingham City", "2004", "2005", appearances=13),
                stint(5, "sydney_fc", "Sydney FC", "2005", "2006", appearances=21),
                stint(6, "sunderland", "Sunderland", "2006", "2009", appearances=59)
            ],
            provider_ids={"transfermarkt": "3239", "wikidata": "Q295556"},
            career_complete=True
        ),
        # 277. Shaka Hislop
        player(
            "shaka_hislop", "Shaka Hislop", "Neil Shaka Hislop",
            ["Hislop", "Neil Shaka Hislop"],
            "1969-02-22", ["Trinidad and Tobago", "England"], "retired",
            [
                stint(1, "reading", "Reading", "1992", "1995", appearances=104),
                stint(2, "newcastle", "Newcastle United", "1995", "1998", appearances=53),
                stint(3, "west_ham", "West Ham United", "1998", "2002", appearances=121),
                stint(4, "portsmouth", "Portsmouth", "2002", "2005", appearances=93),
                stint(5, "west_ham", "West Ham United", "2005", "2006", appearances=18),
                stint(6, "fc_dallas", "FC Dallas", "2006", "2007", appearances=10)
            ],
            provider_ids={"transfermarkt": "3472", "wikidata": "Q453488"},
            career_complete=True
        ),
        # 278. Lucas Radebe
        player(
            "lucas_radebe", "Lucas Radebe", "Lucas Valeriu Radebe",
            ["Radebe", "The Chief", "Lucas Valeriu Radebe"],
            "1969-04-12", ["South Africa"], "retired",
            [
                stint(1, "kaizer_chiefs", "Kaizer Chiefs", "1989", "1994", appearances=113),
                stint(2, "leeds", "Leeds United", "1994", "2005", appearances=201)
            ],
            provider_ids={"transfermarkt": "3645", "wikidata": "Q375549"},
            career_complete=True
        ),
        # 279. Benni McCarthy
        player(
            "benni_mccarthy", "Benni McCarthy", "Benedict Saul McCarthy",
            ["McCarthy", "Benni", "Benedict Saul McCarthy"],
            "1977-11-12", ["South Africa"], "retired",
            [
                stint(1, "seven_stars", "Seven Stars", "1995", "1997", appearances=49),
                stint(2, "ajax", "Ajax", "1997", "1999", appearances=36),
                stint(3, "celta_vigo", "Celta Vigo", "1999", "2001", appearances=52),
                stint(4, "porto", "Porto", "2001", "2002", appearances=11, stint_type="loan"),
                stint(5, "celta_vigo", "Celta Vigo", "2002", "2003", appearances=14),
                stint(6, "porto", "Porto", "2003", "2006", appearances=75),
                stint(7, "blackburn", "Blackburn Rovers", "2006", "2010", appearances=109),
                stint(8, "west_ham", "West Ham United", "2010", "2011", appearances=11),
                stint(9, "orlando_pirates", "Orlando Pirates", "2011", "2013", appearances=24)
            ],
            provider_ids={"transfermarkt": "3427", "wikidata": "Q214223"},
            career_complete=True
        ),
        # 280. Steven Pienaar
        player(
            "steven_pienaar", "Steven Pienaar", "Steven Jerome Pienaar",
            ["Pienaar", "Schillo", "Steven Jerome Pienaar"],
            "1982-03-17", ["South Africa"], "retired",
            [
                stint(1, "ajax_cape_town", "Ajax Cape Town", "1999", "2001", appearances=24),
                stint(2, "ajax", "Ajax", "2001", "2006", appearances=94),
                stint(3, "bvb", "Borussia Dortmund", "2006", "2007", appearances=25),
                stint(4, "everton", "Everton", "2007", "2011", appearances=104),
                stint(5, "tottenham", "Tottenham Hotspur", "2011", "2012", appearances=10),
                stint(6, "everton", "Everton", "2012", "2016", appearances=85),
                stint(7, "sunderland", "Sunderland", "2016", "2017", appearances=15),
                stint(8, "bidvest_wits", "Bidvest Wits", "2017", "2018", appearances=4)
            ],
            provider_ids={"transfermarkt": "4320", "wikidata": "Q211119"},
            career_complete=True
        ),
        # 281. Rigobert Song
        player(
            "rigobert_song", "Rigobert Song", "Rigobert Song Bahanag",
            ["Song", "Magnan", "Rigobert Song Bahanag"],
            "1976-07-01", ["Cameroon", "France"], "retired",
            [
                stint(1, "metz", "Metz", "1994", "1998", appearances=120),
                stint(2, "salernitana", "Salernitana", "1998", "1999", appearances=4),
                stint(3, "lfc", "Liverpool", "1999", "2000", appearances=35),
                stint(4, "west_ham", "West Ham United", "2000", "2002", appearances=24),
                stint(5, "koln", "1. FC Köln", "2001", "2002", appearances=16, stint_type="loan"),
                stint(6, "lens", "Lens", "2002", "2004", appearances=63),
                stint(7, "galatasaray", "Galatasaray", "2004", "2008", appearances=108),
                stint(8, "trabzonspor", "Trabzonspor", "2008", "2010", appearances=47)
            ],
            provider_ids={"transfermarkt": "3424", "wikidata": "Q313155"},
            career_complete=True
        ),
        # 282. Geremi
        player(
            "geremi", "Geremi", "Geremi Sorele Njitap Fotso",
            ["Geremi Njitap", "Geremi Sorele Njitap Fotso"],
            "1978-12-20", ["Cameroon"], "retired",
            [
                stint(1, "racing_bafoussam", "Racing Bafoussam", "1995", "1996", appearances=28),
                stint(2, "genclerbirligi", "Gençlerbirliği", "1997", "1999", appearances=57),
                stint(3, "rmcf", "Real Madrid", "1999", "2003", appearances=45),
                stint(4, "middlesbrough", "Middlesbrough", "2002", "2003", appearances=33, stint_type="loan"),
                stint(5, "cfc", "Chelsea", "2003", "2007", appearances=72),
                stint(6, "newcastle", "Newcastle United", "2007", "2009", appearances=49),
                stint(7, "ankaragucu", "Ankaragücü", "2010", "2010", appearances=12),
                stint(8, "larissa", "Larissa", "2010", "2011", appearances=10)
            ],
            provider_ids={"transfermarkt": "3377", "wikidata": "Q313158"},
            career_complete=True
        ),
        # 283. Seydou Keita
        player(
            "seydou_keita", "Seydou Keita", "Seydou Keita",
            ["Keita"],
            "1980-01-16", ["Mali", "France"], "retired",
            [
                stint(1, "marseille", "Marseille", "1999", "2000", appearances=6),
                stint(2, "lorient", "Lorient", "2000", "2002", appearances=58),
                stint(3, "lens", "Lens", "2002", "2007", appearances=156),
                stint(4, "sevilla", "Sevilla", "2007", "2008", appearances=31),
                stint(5, "fcb", "Barcelona", "2008", "2012", appearances=119),
                stint(6, "dalian_aerbin", "Dalian Aerbin", "2012", "2013", appearances=37),
                stint(7, "valencia", "Valencia", "2014", "2014", appearances=11),
                stint(8, "roma", "Roma", "2014", "2016", appearances=46),
                stint(9, "el_jaish", "El Jaish", "2016", "2017", appearances=16)
            ],
            provider_ids={"transfermarkt": "5486", "wikidata": "Q211123"},
            career_complete=True
        ),
        # 284. Frédéric Kanouté
        player(
            "frederic_kanoute", "Frédéric Kanouté", "Frédéric Oumar Kanouté",
            ["Kanoute", "Frederic Oumar Kanoute"],
            "1977-09-02", ["Mali", "France"], "retired",
            [
                stint(1, "lyon", "Lyon", "1997", "2000", appearances=40),
                stint(2, "west_ham", "West Ham United", "2000", "2003", appearances=84),
                stint(3, "tottenham", "Tottenham Hotspur", "2003", "2005", appearances=60),
                stint(4, "sevilla", "Sevilla", "2005", "2012", appearances=209),
                stint(5, "beijing_guoan", "Beijing Guoan", "2012", "2013", appearances=20)
            ],
            provider_ids={"transfermarkt": "3700", "wikidata": "Q211126"},
            career_complete=True
        ),
        # 285. Emmanuel Adebayor
        player(
            "emmanuel_adebayor", "Emmanuel Adebayor", "Sheyi Emmanuel Adebayor",
            ["Adebayor", "Sheyi Emmanuel Adebayor"],
            "1984-02-26", ["Togo"], "retired",
            [
                stint(1, "metz", "Metz", "2001", "2003", appearances=44),
                stint(2, "monaco", "Monaco", "2003", "2006", appearances=78),
                stint(3, "afc", "Arsenal", "2006", "2009", appearances=104),
                stint(4, "mancity", "Manchester City", "2009", "2012", appearances=34),
                stint(5, "rmcf", "Real Madrid", "2011", "2011", appearances=14, stint_type="loan"),
                stint(6, "tottenham", "Tottenham Hotspur", "2011", "2015", appearances=92),
                stint(7, "crystal_palace", "Crystal Palace", "2016", "2016", appearances=12),
                stint(8, "basaksehir", "İstanbul Başakşehir", "2017", "2019", appearances=60),
                stint(9, "kayserispor", "Kayserispor", "2019", "2019", appearances=8),
                stint(10, "olimpia_asuncion", "Club Olimpia", "2020", "2020", appearances=2),
                stint(11, "semassi", "Semassi", "2021", "2023", appearances=5)
            ],
            provider_ids={"transfermarkt": "8883", "wikidata": "Q483088"},
            career_complete=True
        ),
        # 286. Asamoah Gyan
        player(
            "asamoah_gyan", "Asamoah Gyan", "Asamoah Gyan",
            ["Baby Jet", "Gyan"],
            "1985-11-22", ["Ghana"], "retired",
            [
                stint(1, "liberty_professionals", "Liberty Professionals", "2003", "2003", appearances=16),
                stint(2, "udinese", "Udinese", "2003", "2008", appearances=39),
                stint(3, "modena", "Modena", "2004", "2006", appearances=53, stint_type="loan"),
                stint(4, "rennes", "Rennes", "2008", "2010", appearances=48),
                stint(5, "sunderland", "Sunderland", "2010", "2012", appearances=34),
                stint(6, "al_ain", "Al Ain", "2011", "2015", appearances=65),
                stint(7, "shanghai_sipg", "Shanghai SIPG", "2015", "2017", appearances=20),
                stint(8, "al_ahli_dubai", "Al-Ahli Dubai", "2016", "2017", appearances=14, stint_type="loan"),
                stint(9, "kayserispor", "Kayserispor", "2017", "2019", appearances=26),
                stint(10, "northeast_united", "NorthEast United", "2019", "2020", appearances=8),
                stint(11, "legon_cities", "Legon Cities", "2020", "2021", appearances=5)
            ],
            provider_ids={"transfermarkt": "29432", "wikidata": "Q283733"},
            career_complete=True
        ),
        # 287. Sulley Muntari
        player(
            "sulley_muntari", "Sulley Muntari", "Suleyman Ali Muntari",
            ["Muntari", "Suleyman Ali Muntari"],
            "1984-08-27", ["Ghana"], "retired",
            [
                stint(1, "udinese", "Udinese", "2002", "2007", appearances=125),
                stint(2, "portsmouth", "Portsmouth", "2007", "2008", appearances=29),
                stint(3, "inter", "Inter Milan", "2008", "2012", appearances=70),
                stint(4, "sunderland", "Sunderland", "2011", "2011", appearances=9, stint_type="loan"),
                stint(5, "acmilan", "AC Milan", "2012", "2015", appearances=70),
                stint(6, "al_ittihad", "Al-Ittihad", "2015", "2016", appearances=18),
                stint(7, "pescara", "Pescara", "2017", "2017", appearances=9),
                stint(8, "deportivo", "Deportivo La Coruña", "2018", "2018", appearances=8),
                stint(9, "hearts_of_oak", "Hearts of Oak", "2022", "2022", appearances=11)
            ],
            provider_ids={"transfermarkt": "6031", "wikidata": "Q190693"},
            career_complete=True
        ),
        # 288. Thomas Partey
        player(
            "thomas_partey", "Thomas Partey", "Thomas Teye Partey",
            ["Partey", "Thomas Teye Partey"],
            "1993-06-13", ["Ghana"], "active",
            [
                stint(1, "mallorca", "Mallorca", "2013", "2014", appearances=37, stint_type="loan"),
                stint(2, "almeria", "Almería", "2014", "2015", appearances=31, stint_type="loan"),
                stint(3, "atletico", "Atlético Madrid", "2015", "2020", appearances=132),
                stint(4, "afc", "Arsenal", "2020", None, appearances=95)
            ],
            provider_ids={"transfermarkt": "230784", "wikidata": "Q15964468"},
            career_complete=False,
            exclusions=[{"club": "Atlético Madrid B", "reason": "b-team-only", "evidence": "Played 33 matches in Segunda División B 2012-13 before senior loans."}]
        ),
        # 289. Mustapha Hadji
        player(
            "mustapha_hadji", "Mustapha Hadji", "Mustapha Hadji",
            ["Hadji"],
            "1971-11-16", ["Morocco", "France"], "retired",
            [
                stint(1, "nancy", "Nancy", "1991", "1996", appearances=176),
                stint(2, "sporting", "Sporting CP", "1996", "1997", appearances=38),
                stint(3, "deportivo", "Deportivo La Coruña", "1997", "1999", appearances=31),
                stint(4, "coventry", "Coventry City", "1999", "2001", appearances=62),
                stint(5, "aston_villa", "Aston Villa", "2001", "2004", appearances=35),
                stint(6, "espanyol", "Espanyol", "2004", "2004", appearances=9),
                stint(7, "al_ain", "Al Ain", "2004", "2005", appearances=15),
                stint(8, "saarbrucken", "1. FC Saarbrücken", "2005", "2007", appearances=54),
                stint(9, "fola_esch", "Fola Esch", "2007", "2010", appearances=44)
            ],
            provider_ids={"transfermarkt": "3845", "wikidata": "Q375591"},
            career_complete=True
        ),
        # 290. Noureddine Naybet
        player(
            "noureddine_naybet", "Noureddine Naybet", "Noureddine Naybet",
            ["Naybet"],
            "1970-02-10", ["Morocco"], "retired",
            [
                stint(1, "wydad", "Wydad Casablanca", "1989", "1993", appearances=74),
                stint(2, "nantes", "Nantes", "1993", "1994", appearances=34),
                stint(3, "sporting", "Sporting CP", "1994", "1996", appearances=54),
                stint(4, "deportivo", "Deportivo La Coruña", "1996", "2004", appearances=211),
                stint(5, "tottenham", "Tottenham Hotspur", "2004", "2006", appearances=30)
            ],
            provider_ids={"transfermarkt": "3971", "wikidata": "Q312489"},
            career_complete=True
        ),
        # 291. Rabah Madjer
        player(
            "rabah_madjer", "Rabah Madjer", "Rabah Mustapha Madjer",
            ["Madjer", "Mustapha Madjer"],
            "1958-12-15", ["Algeria"], "retired",
            [
                stint(1, "na_hussein_dey", "NA Hussein Dey", "1974", "1983", appearances=94),
                stint(2, "rc_paris", "Racing Paris", "1983", "1985", appearances=50),
                stint(3, "tours", "Tours", "1985", "1985", appearances=7),
                stint(4, "porto", "Porto", "1985", "1988", appearances=50),
                stint(5, "valencia", "Valencia", "1988", "1988", appearances=14, stint_type="loan"),
                stint(6, "porto", "Porto", "1988", "1991", appearances=58),
                stint(7, "qatar_sc", "Qatar SC", "1991", "1992", appearances=10)
            ],
            provider_ids={"transfermarkt": "116719", "wikidata": "Q310461"},
            career_complete=True
        ),
        # 292. Lakhdar Belloumi
        player(
            "lakhdar_belloumi", "Lakhdar Belloumi", "Lakhdar Belloumi",
            ["Belloumi"],
            "1958-12-29", ["Algeria"], "retired",
            [
                stint(1, "gc_mascara", "GC Mascara", "1977", "1979", appearances=38),
                stint(2, "mp_oran", "MC Oran", "1979", "1981", appearances=31),
                stint(3, "gc_mascara", "GC Mascara", "1981", "1987", appearances=120),
                stint(4, "al_arabi_qa", "Al-Arabi", "1988", "1988", appearances=6),
                stint(5, "mp_oran", "MC Oran", "1988", "1990", appearances=32),
                stint(6, "gc_mascara", "GC Mascara", "1990", "1994", appearances=70),
                stint(7, "asm_oran", "ASM Oran", "1997", "1999", appearances=34)
            ],
            provider_ids={"transfermarkt": "132479", "wikidata": "Q214227"},
            career_complete=True
        ),
        # 293. Bruce Grobbelaar
        player(
            "bruce_grobbelaar", "Bruce Grobbelaar", "Bruce David Grobbelaar",
            ["Grobbelaar", "The Jungleman", "Bruce David Grobbelaar"],
            "1957-10-06", ["Zimbabwe", "South Africa"], "retired",
            [
                stint(1, "highlands_park", "Highlands Park", "1977", "1977", appearances=4),
                stint(2, "durban_city", "Durban City", "1978", "1978", appearances=1),
                stint(3, "vancouver_whitecaps", "Vancouver Whitecaps", "1979", "1980", appearances=24),
                stint(4, "crewe_alexandra", "Crewe Alexandra", "1979", "1980", appearances=24, stint_type="loan"),
                stint(5, "lfc", "Liverpool", "1981", "1994", appearances=440),
                stint(6, "stoke", "Stoke City", "1992", "1993", appearances=4, stint_type="loan"),
                stint(7, "southampton", "Southampton", "1994", "1996", appearances=32),
                stint(8, "plymouth", "Plymouth Argyle", "1996", "1997", appearances=13),
                stint(9, "oldham", "Oldham Athletic", "1997", "1997", appearances=4),
                stint(10, "bury", "Bury", "1998", "1998", appearances=4),
                stint(11, "lincoln_city", "Lincoln City", "1998", "1998", appearances=2)
            ],
            provider_ids={"transfermarkt": "145786", "wikidata": "Q363870"},
            career_complete=True
        ),
        # 294. Shinji Kagawa
        player(
            "shinji_kagawa", "Shinji Kagawa", "Shinji Kagawa",
            ["Kagawa"],
            "1989-03-17", ["Japan"], "active",
            [
                stint(1, "cerezo_osaka", "Cerezo Osaka", "2006", "2010", appearances=127),
                stint(2, "bvb", "Borussia Dortmund", "2010", "2012", appearances=49),
                stint(3, "manu", "Manchester United", "2012", "2014", appearances=38),
                stint(4, "bvb", "Borussia Dortmund", "2014", "2019", appearances=99),
                stint(5, "besiktas", "Beşiktaş", "2019", "2019", appearances=14, stint_type="loan"),
                stint(6, "zaragoza", "Real Zaragoza", "2019", "2020", appearances=31),
                stint(7, "paok", "PAOK", "2021", "2021", appearances=6),
                stint(8, "sint_truiden", "Sint-Truiden", "2022", "2023", appearances=18),
                stint(9, "cerezo_osaka", "Cerezo Osaka", "2023", None, appearances=48)
            ],
            provider_ids={"transfermarkt": "81785", "wikidata": "Q186419"},
            career_complete=False
        ),
        # 295. Shunsuke Nakamura
        player(
            "shunsuke_nakamura", "Shunsuke Nakamura", "Shunsuke Nakamura",
            ["Nakamura"],
            "1978-06-24", ["Japan"], "retired",
            [
                stint(1, "yokohama_f_marinos", "Yokohama F. Marinos", "1997", "2002", appearances=148),
                stint(2, "reggina", "Reggina", "2002", "2005", appearances=81),
                stint(3, "celtic", "Celtic", "2005", "2009", appearances=128),
                stint(4, "espanyol", "Espanyol", "2009", "2010", appearances=13),
                stint(5, "yokohama_f_marinos", "Yokohama F. Marinos", "2010", "2016", appearances=190),
                stint(6, "jubilo_iwata", "Júbilo Iwata", "2017", "2019", appearances=48),
                stint(7, "yokohama_fc", "Yokohama FC", "2019", "2022", appearances=36)
            ],
            provider_ids={"transfermarkt": "6069", "wikidata": "Q191138"},
            career_complete=True
        ),
        # 296. Kazuyoshi Miura
        player(
            "kazuyoshi_miura", "Kazuyoshi Miura", "Kazuyoshi Miura",
            ["King Kazu", "Miura"],
            "1967-02-26", ["Japan"], "active",
            [
                stint(1, "santos", "Santos", "1986", "1986", appearances=2),
                stint(2, "palmeiras", "Palmeiras", "1986", "1986", appearances=2),
                stint(3, "matsubara", "Matsubara", "1987", "1987", appearances=5),
                stint(4, "crb", "CRB", "1987", "1988", appearances=4),
                stint(5, "xv_de_jau", "XV de Jaú", "1988", "1988", appearances=25),
                stint(6, "coritiba", "Coritiba", "1988", "1989", appearances=21),
                stint(7, "santos", "Santos", "1990", "1990", appearances=25),
                stint(8, "verdy_kawasaki", "Verdy Kawasaki", "1990", "1998", appearances=192),
                stint(9, "genoa", "Genoa", "1994", "1995", appearances=21, stint_type="loan"),
                stint(10, "dinamo_zagreb", "Dinamo Zagreb", "1999", "1999", appearances=12),
                stint(11, "kyoto_sanga", "Kyoto Purple Sanga", "1999", "2000", appearances=41),
                stint(12, "vissel_kobe", "Vissel Kobe", "2001", "2005", appearances=103),
                stint(13, "yokohama_fc", "Yokohama FC", "2005", "2021", appearances=252),
                stint(14, "sydney_fc", "Sydney FC", "2005", "2005", appearances=4, stint_type="loan"),
                stint(15, "oliveirense", "Oliveirense", "2023", "2024", appearances=8, stint_type="loan"),
                stint(16, "atletico_suzuka", "Atletico Suzuka", "2024", None, appearances=11, stint_type="loan")
            ],
            provider_ids={"transfermarkt": "112589", "wikidata": "Q367465"},
            career_complete=False
        ),
        # 297. Cha Bum-kun
        player(
            "cha_bum_kun", "Cha Bum-kun", "Cha Bum-kun",
            ["Cha Boom", "Tscha Bum"],
            "1953-05-22", ["South Korea"], "retired",
            [
                stint(1, "seoul_trust_bank", "Seoul Trust Bank", "1976", "1976", appearances=10),
                stint(2, "air_force", "ROK Air Force", "1976", "1978", appearances=40),
                stint(3, "darmstadt", "SV Darmstadt 98", "1978", "1979", appearances=1),
                stint(4, "eintracht_frankfurt", "Eintracht Frankfurt", "1979", "1983", appearances=122),
                stint(5, "leverkusen", "Bayer Leverkusen", "1983", "1989", appearances=185)
            ],
            provider_ids={"transfermarkt": "67727", "wikidata": "Q332514"},
            career_complete=True
        ),
        # 298. Ali Daei
        player(
            "ali_daei", "Ali Daei", "Ali Daei",
            ["Shahriar", "Daei"],
            "1969-03-21", ["Iran"], "retired",
            [
                stint(1, "esteghlal_ardabil", "Esteghlal Ardabil", "1988", "1989", appearances=15),
                stint(2, "taxirani", "Taxirani", "1989", "1990", appearances=20),
                stint(3, "bank_tejarat", "Bank Tejarat", "1990", "1994", appearances=50),
                stint(4, "persepolis", "Persepolis", "1994", "1996", appearances=38),
                stint(5, "al_sadd", "Al Sadd", "1996", "1997", appearances=16),
                stint(6, "arminia_bielefeld", "Arminia Bielefeld", "1997", "1998", appearances=25),
                stint(7, "bayern", "Bayern Munich", "1998", "1999", appearances=23),
                stint(8, "hertha_bsc", "Hertha BSC", "1999", "2002", appearances=59),
                stint(9, "al_shabab_ae", "Al Shabab", "2002", "2003", appearances=25),
                stint(10, "persepolis", "Persepolis", "2003", "2004", appearances=28),
                stint(11, "saba_battery", "Saba Battery", "2004", "2006", appearances=51),
                stint(12, "saipa", "Saipa", "2006", "2007", appearances=26)
            ],
            provider_ids={"transfermarkt": "1456", "wikidata": "Q206349"},
            career_complete=True
        ),
        # 299. Mehdi Mahdavikia
        player(
            "mehdi_mahdavikia", "Mehdi Mahdavikia", "Mehdi Mahdavikia",
            ["The Rocket", "Mahdavikia"],
            "1977-07-24", ["Iran"], "retired",
            [
                stint(1, "bank_melli", "Bank Melli", "1991", "1995", appearances=20),
                stint(2, "persepolis", "Persepolis", "1995", "1998", appearances=54),
                stint(3, "vfl_bochum", "VfL Bochum", "1998", "1999", appearances=12, stint_type="loan"),
                stint(4, "hamburger_sv", "Hamburger SV", "1999", "2007", appearances=211),
                stint(5, "eintracht_frankfurt", "Eintracht Frankfurt", "2007", "2010", appearances=32),
                stint(6, "steel_azin", "Steel Azin", "2010", "2011", appearances=34),
                stint(7, "damash_gilan", "Damash Gilan", "2011", "2011", appearances=14),
                stint(8, "persepolis", "Persepolis", "2012", "2013", appearances=27)
            ],
            provider_ids={"transfermarkt": "304", "wikidata": "Q313175"},
            career_complete=True
        ),
        # 300. Hakan Şükür
        player(
            "hakan_sukur", "Hakan Şükür", "Hakan Şükür",
            ["Sukur", "Bull of the Bosphorus", "Hakan Sukur"],
            "1971-09-01", ["Turkey"], "retired",
            [
                stint(1, "sakaryaspor", "Sakaryaspor", "1987", "1990", appearances=42),
                stint(2, "bursaspor", "Bursaspor", "1990", "1992", appearances=54),
                stint(3, "galatasaray", "Galatasaray", "1992", "1995", appearances=90),
                stint(4, "torino", "Torino", "1995", "1995", appearances=5),
                stint(5, "galatasaray", "Galatasaray", "1995", "2000", appearances=156),
                stint(6, "inter", "Inter Milan", "2000", "2001", appearances=24),
                stint(7, "parma", "Parma", "2002", "2002", appearances=15),
                stint(8, "blackburn", "Blackburn Rovers", "2002", "2003", appearances=9),
                stint(9, "galatasaray", "Galatasaray", "2003", "2008", appearances=146)
            ],
            provider_ids={"transfermarkt": "3381", "wikidata": "Q192976"},
            career_complete=True
        )
    ]
    
    assert len(players) == 90, f"Expected 90 players in batch 3, got {len(players)}"
    return players

if __name__ == "__main__":
    p = generate()
    print(f"Batch 3 successfully generated: {len(p)} players.")
