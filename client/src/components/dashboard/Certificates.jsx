import { Link } from "react-router-dom";
import {
  Award,
  ArrowRight,
  Download,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

const getCertificateTitle = (certificate) => {
  return (
    certificate?.event?.title ||
    certificate?.event?.name ||
    certificate?.title ||
    "Participation Certificate"
  );
};

const getCertificateNumber = (certificate) => {
  return (
    certificate?.certificateNumber ||
    certificate?.number ||
    certificate?.certificateId ||
    null
  );
};

const formatDate = (date) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function Certificates({
  certificates = [],
  loading = false,
}) {
  const visibleCertificates =
    certificates.slice(0, 3);

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card/70
        shadow-card
        backdrop-blur-xl
      "
    >
      {/* Header */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-b
          border-border
          p-6
          sm:flex-row
          sm:items-center
          sm:justify-between
          md:p-7
        "
      >
        <div>
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-amber-400/20
                bg-amber-400/10
                text-amber-400
              "
            >
              <Award size={21} />
            </div>

            <h2
              className="
                text-xl
                font-bold
                text-foreground
                md:text-2xl
              "
            >
              My Certificates
            </h2>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Your participation and achievement certificates
          </p>
        </div>

        <Link
          to="/certificates"
          className="
            group
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-amber-400
            transition-colors
            hover:text-amber-300
          "
        >
          View All

          <ArrowRight
            size={16}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </Link>
      </div>

      {/* Content */}

      <div className="p-6 md:p-7">

        {/* Loading */}

        {loading && (
          <div
            className="
              flex
              min-h-36
              items-center
              justify-center
              text-muted-foreground
            "
          >
            <div className="flex items-center gap-3">
              <Loader2
                size={20}
                className="animate-spin text-amber-400"
              />

              <span>
                Loading certificates...
              </span>
            </div>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          visibleCertificates.length === 0 && (
            <div
              className="
                flex
                min-h-36
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-border
                bg-background/40
                px-6
                text-center
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-amber-400/20
                  bg-amber-400/10
                  text-amber-400
                "
              >
                <Award size={22} />
              </div>

              <h3 className="mt-4 font-semibold text-foreground">
                No certificates yet
              </h3>

              <p
                className="
                  mt-2
                  max-w-md
                  text-sm
                  text-muted-foreground
                "
              >
                Participate in Scintillace events to
                receive your certificates here.
              </p>
            </div>
          )}

        {/* Certificates */}

        {!loading &&
          visibleCertificates.length > 0 && (
            <div className="space-y-3">
              {visibleCertificates.map(
                (certificate, index) => {
                  const title =
                    getCertificateTitle(
                      certificate,
                    );

                  const number =
                    getCertificateNumber(
                      certificate,
                    );

                  const date = formatDate(
                    certificate?.issuedAt ||
                      certificate?.issueDate ||
                      certificate?.createdAt,
                  );

                  return (
                    <motion.div
                      key={
                        certificate?._id ||
                        certificate?.id ||
                        number ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.05,
                      }}
                      className="
                        group
                        flex
                        flex-col
                        gap-4
                        rounded-2xl
                        border
                        border-border
                        bg-background/40
                        p-4
                        transition-all
                        duration-300
                        hover:border-amber-400/30
                        hover:bg-card
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-4
                        "
                      >
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-amber-400/20
                            bg-amber-400/10
                            text-amber-400
                          "
                        >
                          <Award size={20} />
                        </div>

                        <div className="min-w-0">
                          <h3
                            className="
                              truncate
                              font-semibold
                              text-foreground
                            "
                          >
                            {title}
                          </h3>

                          <div
                            className="
                              mt-1
                              flex
                              flex-wrap
                              gap-x-3
                              text-xs
                              text-muted-foreground
                            "
                          >
                            {number && (
                              <span>
                                {number}
                              </span>
                            )}

                            {date && (
                              <span>
                                Issued {date}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/certificates"
                        className="
                          inline-flex
                          shrink-0
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-border
                          bg-background/60
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-muted-foreground
                          transition-all
                          duration-300
                          hover:border-amber-400/30
                          hover:bg-amber-400/10
                          hover:text-amber-400
                        "
                      >
                        <Download size={15} />

                        View
                      </Link>
                    </motion.div>
                  );
                },
              )}
            </div>
          )}
      </div>
    </motion.section>
  );
}