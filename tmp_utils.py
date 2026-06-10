from data_classes import SignupEntry

def load_signups(csv_path: str) -> list[SignupEntry]:
    signups = []

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            signups.append(
                SignupEntry(
                    date=row["date"].strip(),
                    name=row["name"].strip(),
                    status=row["status"].strip().lower(),
                    gender=row["gender"].strip(),
                    player_type=row["type"]
                )
            )

    return signups